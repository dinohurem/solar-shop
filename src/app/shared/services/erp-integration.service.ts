import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * ERP Stock Item as returned from the API
 * Note: API uses uppercase field names
 */
export interface ErpStockItem {
  ARTIKL: string;      // Šifra artikla (Product SKU)
  RADJED: string;      // Šifra radne jedinice (Unit ID)
  ZALIHA: number;      // Količina (Stock quantity)
  VEL_CIJENA: number;  // Veleprodajna cijena (Wholesale price)
  MAL_CIJENA: number;  // Maloprodajna cijena (Retail price)
}

/**
 * Normalized stock item for internal use
 */
export interface StockItem {
  sku: string;           // Šifra artikla
  unitId: string;        // Šifra radne jedinice
  quantity: number;      // Količina
  wholesalePrice: number; // Veleprodajna cijena
  retailPrice: number;   // Maloprodajna cijena
}

export interface ErpStockResponse {
  success: boolean;
  data?: StockItem[];
  rawData?: ErpStockItem[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErpIntegrationService {
  private readonly ERP_BASE_URL = 'http://hb-server2012.ddns.net:65399';
  private readonly STOCK_ENDPOINT = '/zaliha';

  constructor(private http: HttpClient) {}

  /**
   * Get all stock information from ERP system
   * @param sku - Optional šifra artikla to filter by (sent as 'artikl' to ERP)
   * @param unitId - Optional šifra radne jedinice to filter by (sent as 'radjed' to ERP)
   * @returns Observable of stock data
   */
  getStock(sku?: string, unitId?: string): Observable<ErpStockResponse> {
    let params = new HttpParams();

    if (sku) {
      params = params.set('artikl', sku);
    }

    if (unitId) {
      params = params.set('radjed', unitId);
    }

    const url = `${this.ERP_BASE_URL}${this.STOCK_ENDPOINT}`;

    return this.http.get<ErpStockItem[]>(url, { params }).pipe(
      map(response => {
        const rawData = Array.isArray(response) ? response : [response];
        const normalizedData: StockItem[] = rawData.map(item => ({
          sku: item.ARTIKL,
          unitId: item.RADJED,
          quantity: item.ZALIHA,
          wholesalePrice: item.VEL_CIJENA,
          retailPrice: item.MAL_CIJENA
        }));

        return {
          success: true,
          data: normalizedData,
          rawData: rawData
        };
      }),
      catchError(error => {
        console.error('ERP Stock fetch failed:', error);
        return of({
          success: false,
          error: error.message || 'Failed to fetch stock from ERP'
        });
      })
    );
  }

  /**
   * Get all stock data (no filters)
   * @returns Observable of all stock data
   */
  getAllStock(): Observable<ErpStockResponse> {
    return this.getStock();
  }

  /**
   * Get stock for a specific product across all units
   * @param sku - Šifra artikla
   * @returns Observable of stock data for all units
   */
  getStockBySku(sku: string): Observable<ErpStockResponse> {
    return this.getStock(sku);
  }

  /**
   * Get stock for a specific product and unit
   * @param sku - Šifra artikla
   * @param unitId - Šifra radne jedinice
   * @returns Observable of stock data for specific product and unit
   */
  getStockBySkuAndUnit(sku: string, unitId: string): Observable<ErpStockResponse> {
    return this.getStock(sku, unitId);
  }

  /**
   * Calculate total stock quantity for a product across all units
   * @param sku - Šifra artikla
   * @returns Observable of total stock quantity
   */
  getTotalStockQuantity(sku: string): Observable<number> {
    return this.getStockBySku(sku).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.reduce((total, item) => total + item.quantity, 0);
        }
        return 0;
      })
    );
  }
}
