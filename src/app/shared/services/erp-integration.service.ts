import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * ERP Stock Item as returned from the API
 * Note: API uses uppercase field names
 */
export interface ErpStockItem {
  ARTIKL: string;      // Šifra artikla (Product SKU)
  RADJED: string;      // Šifra radne jedinice (Unit ID)
  RADJEDNAZIV?: string; // Naziv radne jedinice (Unit name)
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
  unitName?: string;     // Naziv radne jedinice
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
  private readonly ERP_BASE_URL = environment.erp.baseUrl;
  private readonly STOCK_ENDPOINT = '/zaliha';
  private readonly AUTH_TOKEN = environment.erp.authToken;
  private readonly ERP_ENABLED = environment.erp.enabled;

  constructor(private http: HttpClient) {}

  /**
   * Get all stock information from ERP system
   * @param sku - Optional šifra artikla to filter by (sent as 'artikl' to ERP)
   * @param unitId - Optional šifra radne jedinice to filter by (sent as 'radjed' to ERP)
   * @returns Observable of stock data
   */
  getStock(sku?: string, unitId?: string): Observable<ErpStockResponse> {
    // Check if ERP integration is enabled
    if (!this.ERP_ENABLED) {
      console.warn('[ERP] Integration is disabled in this environment');
      return of({
        success: false,
        error: 'ERP integracija nije dostupna u ovom okruženju.'
      });
    }

    // Check if we're using a proxy (no /zaliha endpoint in URL)
    const isProxy = this.ERP_BASE_URL.includes('/api/erp-proxy');

    // Build query parameters
    let params = new HttpParams();

    // Only add auth token if NOT using proxy (proxy handles auth internally)
    if (!isProxy && this.AUTH_TOKEN) {
      params = params.set('auth', this.AUTH_TOKEN);
    }

    if (sku) {
      params = params.set('artikl', sku);
    }

    if (unitId) {
      params = params.set('radjed', unitId);
    }

    // Build URL - proxy doesn't need /zaliha endpoint
    const url = isProxy ? this.ERP_BASE_URL : `${this.ERP_BASE_URL}${this.STOCK_ENDPOINT}`;
    console.log('[ERP] Fetching from:', isProxy ? 'proxy' : 'direct', url);

    return this.http.get<ErpStockItem[]>(url, { params }).pipe(
      map(response => {
        const rawData = Array.isArray(response) ? response : [response];
        const normalizedData: StockItem[] = rawData.map(item => ({
          sku: item.ARTIKL,
          unitId: item.RADJED,
          unitName: item.RADJEDNAZIV || item.RADJED, // Fallback to unit ID if name not available
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

        // Provide user-friendly error messages based on error type
        let errorMessage = 'Greška pri povezivanju s ERP sustavom';

        if (error.status === 0) {
          // Network error, CORS, or SSL certificate issue
          errorMessage = 'Nije moguće povezati se s ERP serverom. Mogući uzroci:\n' +
            '• SSL certifikat servera nije valjan\n' +
            '• CORS politika blokira zahtjev\n' +
            '• Server nije dostupan\n' +
            '• Provjerite mrežnu vezu';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Autentifikacija neuspješna. Molimo provjerite auth token.';
        } else if (error.status === 404) {
          errorMessage = 'ERP endpoint nije pronađen.';
        } else if (error.status === 500) {
          errorMessage = 'Greška na ERP serveru. Pokušajte ponovno kasnije.';
        } else if (error.message && !error.message.includes('Http failure')) {
          errorMessage = error.message;
        }

        return of({
          success: false,
          error: errorMessage
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
