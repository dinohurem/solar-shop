import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, subscribeOn } from 'rxjs';

export type SupportedLanguage = 'hr' | 'en';

export interface Translations {
    [key: string]: string | Translations;
}

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>('hr');
    private translations: Record<SupportedLanguage, Translations> = {
        hr: {
            // Navigation
            nav: {
                products: 'Proizvodi',
                offers: 'Ponude',
                sustainability: 'Održivost',
                blog: 'Blog',
                company: 'O nama',
                contact: 'Kontakt',
                partners: 'Partneri',
                searchPlaceholder: 'Traži proizvode...'
            },
            // B2B Navigation
            b2bNav: {
                home: 'Početna',
                products: 'Proizvodi',
                offers: 'Ponude',
                about: 'O nama',
                contact: 'Kontakt',
                signIn: 'Prijavite se',
                getStarted: 'Počnite',
                dashboard: 'Nadzorna ploča',
                profile: 'Profil',
                orders: 'Narudžbe',
                signOut: 'Odjava',
                partner: 'Partner'
            },
            // Authentication
            auth: {
                welcome: 'Dobrodošli natrag',
                welcomeMessage: 'Prijavite se u svoj račun',
                signIn: 'Prijavite se u svoj račun',
                noAccount: 'Nemate račun?',
                signUp: 'Registrirajte se',
                email: 'Email adresa',
                password: 'Lozinka',
                forgotPassword: 'Zaboravili ste lozinku?',
                signInButton: 'Prijavite se',
                signingIn: 'Prijavljujem...',
                backToHome: 'Natrag na početnu',
                emailRequired: 'Email adresa je obavezna',
                emailInvalid: 'Unesite valjanu email adresu',
                passwordRequired: 'Lozinka je obavezna',
                passwordMinLength: 'Lozinka mora imati najmanje {{min}} znakova',
                fieldRequired: '{{field}} je obavezno',
                loginError: 'Neispravni podaci za prijavu',
                required: '{{field}} je obavezno',
                invalidEmail: 'Unesite valjanu email adresu'
            },
            // Register
            register: {
                title: 'Pridružite se SolarShop',
                subtitle: 'Stvorite svoj račun za početak',
                alreadyHaveAccount: 'Već imate račun?',
                signIn: 'Prijavite se',
                firstName: 'Ime',
                firstNameRequired: 'Ime je obavezno',
                lastName: 'Prezime',
                lastNameRequired: 'Prezime je obavezno',
                email: 'Email adresa',
                emailRequired: 'Email adresa je obavezna',
                emailInvalid: 'Unesite valjanu email adresu',
                phoneNumber: 'Broj telefona',
                phoneNumberInvalid: 'Unesite valjan broj telefona',
                address: 'Adresa',
                password: 'Lozinka',
                passwordRequired: 'Lozinka je obavezna',
                passwordMinLength: 'Lozinka mora imati najmanje 8 znakova',
                confirmPassword: 'Potvrdite lozinku',
                confirmPasswordRequired: 'Potvrda lozinke je obavezna',
                passwordMismatch: 'Lozinke se ne podudaraju',
                createAccount: 'Stvori račun',
                creatingAccount: 'Stvaram račun...',
                enterFirstName: 'Unesite svoje ime',
                enterLastName: 'Unesite svoje prezime',
                enterEmail: 'Unesite svoju email adresu',
                enterPhone: 'Unesite svoj broj telefona',
                enterAddress: 'Unesite svoju punu adresu',
                createPassword: 'Stvorite lozinku',
                confirmYourPassword: 'Potvrdite svoju lozinku'
            },
            // Forgot Password
            forgotPassword: {
                title: 'Zaboravili ste lozinku?',
                subtitle: 'Nema problema, poslat ćemo vam upute za resetiranje.',
                rememberPassword: 'Sjećate se lozinke?',
                signIn: 'Prijavite se',
                email: 'Email adresa',
                enterEmail: 'Unesite svoj email',
                resetPassword: 'Resetiraj lozinku',
                sendingResetEmail: 'Šalje se email za resetiranje...',
                backToHome: 'Natrag na početnu'
            },
            // Partners Register
            partnersRegister: {
                title: 'Registracija partnera',
                subtitle: 'Pridružite se našoj mreži partnera',
                step1: 'Osobni podaci',
                step2: 'Podaci o tvrtki',
                personalInfo: 'Osobne informacije',
                companyInfo: 'Informacije o tvrtki',
                companyName: 'Naziv tvrtke',
                companyNameRequired: 'Naziv tvrtke je obavezan',
                taxNumber: 'OIB',
                taxNumberRequired: 'OIB je obavezan',
                taxNumberInvalid: 'Unesite valjan OIB',
                companyAddress: 'Adresa tvrtke',
                companyAddressRequired: 'Adresa tvrtke je obavezna',
                companyPhone: 'Telefon tvrtke',
                companyPhoneRequired: 'Telefon tvrtke je obavezan',
                companyEmail: 'Email tvrtke',
                companyEmailRequired: 'Email tvrtke je obavezan',
                website: 'Web stranica',
                businessType: 'Vrsta poslovanja',
                businessTypeRequired: 'Vrsta poslovanja je obavezna',
                retailer: 'Trgovac na malo',
                wholesaler: 'Trgovac na veliko',
                installer: 'Instaler',
                distributor: 'Distributer',
                other: 'Ostalo',
                yearsInBusiness: 'Godine u poslovanju',
                yearsInBusinessRequired: 'Godine u poslovanju su obavezne',
                annualRevenue: 'Godišnji prihod (EUR)',
                numberOfEmployees: 'Broj zaposlenika',
                description: 'Opis tvrtke',
                descriptionPlaceholder: 'Opišite svoju tvrtku i djelatnost...',
                previousStep: 'Prethodni korak',
                nextStep: 'Sljedeći korak',
                submitApplication: 'Pošaljite zahtjev',
                submittingApplication: 'Šalje se zahtjev...',
                applicationSubmitted: 'Zahtjev je uspješno poslan!',
                applicationMessage: 'Vaš zahtjev za partnerstvo je poslan na pregled. Kontaktirat ćemo vas uskoro.',
                enterCompanyName: 'Unesite naziv tvrtke',
                enterTaxNumber: 'Unesite OIB tvrtke',
                enterCompanyAddress: 'Unesite adresu tvrtke',
                enterCompanyPhone: 'Unesite telefon tvrtke',
                enterCompanyEmail: 'Unesite email tvrtke',
                enterWebsite: 'Unesite web stranicu (opcionalno)',
                selectBusinessType: 'Odaberite vrstu poslovanja',
                enterYearsInBusiness: 'Unesite godine u poslovanju',
                enterAnnualRevenue: 'Unesite godišnji prihod (opcionalno)',
                enterNumberOfEmployees: 'Unesite broj zaposlenika (opcionalno)'
            },
            // B2B Hero
            b2b: {
                hero: {
                    title: 'Postanite naš partner',
                    subtitle: 'Pridružite se našoj mreži partnera i otkrijte ekskluzivne prednosti, posebne cijene i podršku za vaš biznis.',
                    getStarted: 'Počnite',
                    learnMore: 'Saznajte više'
                },
                about: {
                    title: 'O partnerstvu',
                    subtitle: 'Zašto se pridružiti SolarShop partneru',
                    benefits: 'Prednosti partnerstva',
                    exclusivePricing: 'Ekskluzivne cijene',
                    exclusivePricingText: 'Pristup posebnim cijenama i popustima za partnere.',
                    dedicatedSupport: 'Posvećena podrška',
                    dedicatedSupportText: 'Osobni account manager i tehnička podrška.',
                    marketingSupport: 'Marketing podrška',
                    marketingSupportText: 'Materijali za marketing i podrška u promociji.',
                    training: 'Obuka i edukacija',
                    trainingText: 'Redovite obuke o proizvodima i tehnologijama.',
                    requirements: 'Uvjeti za partnerstvo',
                    requirementsText: 'Saznajte što trebate za postajanje našeg partnera.',
                    businessExperience: 'Iskustvo u poslovanju',
                    businessExperienceText: 'Minimalno 2 godine iskustva u solarnoj industriji.',
                    financialStability: 'Financijska stabilnost',
                    financialStabilityText: 'Dokazana financijska stabilnost i kreditna sposobnost.',
                    technicalCapability: 'Tehnička sposobnost',
                    technicalCapabilityText: 'Kvalificirani tim za instalaciju i održavanje.',
                    commitment: 'Predanost kvaliteti',
                    commitmentText: 'Predanost pružanju visokokvalitetnih usluga kupcima.',
                    readyToJoin: 'Spremni ste se pridružiti našoj mreži partnera?',
                    startApplicationToday: 'Počnite s prijavljením danas i otključajte ekskluzivne prednosti za vaš biznis.'
                },
                contact: {
                    title: 'Kontakt za partnere',
                    subtitle: 'Imate pitanja o partnerstvu? Kontaktirajte nas.',
                    getInTouch: 'Kontaktirajte nas',
                    partnerSupportText: 'Podrška za partnere je dostupna 24/7 da vam pomogne s bilo kojim pitanjima ili problemima.',
                    partnershipInquiry: 'Upit o partnerstvu',
                    name: 'Ime',
                    email: 'Email',
                    company: 'Tvrtka',
                    message: 'Poruka',
                    sendMessage: 'Pošaljite poruku',
                    sendingMessage: 'Šalje se poruka...',
                    messageSent: 'Poruka je poslana!',
                    enterName: 'Unesite svoje ime',
                    enterEmail: 'Unesite svoj email',
                    enterCompany: 'Unesite naziv tvrtke',
                    enterMessage: 'Unesite svoju poruku',
                    partnerSupport: 'Podrška za partnere',
                    phone: '+385 1 234 5678',
                    salesTeam: 'Prodajni tim',
                    salesTeamText: 'Naš prodajni tim je dostupan da vam pomogne s bilo kojim pitanjima ili problemima.',
                    salesTeamEmail: 'sales@solarshop.hr',
                    salesTeamPhone: '+385 1 234 5679',
                    technicalSupport: 'Tehnička podrška',
                    technicalSupportText: 'Naš tehnički tim je dostupan da vam pomogne s bilo kojim pitanjima ili problemima.',
                    technicalSupportEmail: 'tech@solarshop.hr',
                    technicalSupportPhone: '+385 1 234 5680',
                    supportEmail: 'partners@solarshop.hr',
                    officeAddress: 'Ilica 1, 10000 Zagreb, Croatia',
                    address: 'Ilica 1, 10000 Zagreb, Croatia',
                    businessHours: 'Radno vrijeme: Pon-Pet 8:00-17:00',
                    mondayFriday: 'Pon-Pet',
                    saturday: 'Sub',
                    sunday: 'Ned',
                    closed: 'Zatvoreno',
                    subject: 'Predmet',
                    selectSubject: 'Odaberi predmet',
                    selectSubjectRequired: 'Predmet je obavezan',
                    pricingInquiry: 'Upit o cijenama',
                    salesInquiry: 'Upit o prodaji',
                    messagePlaceholder: 'Unesite svoju poruku...',
                },
                products: {
                    title: 'Partnerski proizvodi',
                    subtitle: 'Ekskluzivni proizvodi i cijene za naše partnere',
                    productCategories: 'Kategorije proizvoda',
                    ourBrands: 'Naši brendovi',
                    premiumInverterSolutions: 'Premium rješenja za invertere',
                    reliableSolarTechnology: 'Pouzdana solarna tehnologija',
                    smartEnergySolutions: 'Pametna energetska rješenja',
                    partnerPrice: 'Partnerska cijena',
                    retailPrice: 'Maloprodajna cijena',
                    savings: 'Ušteda',
                    loginToViewPrices: 'Prijavite se za pregled cijena',
                    minimumOrder: 'Minimalna narudžba',
                    pieces: 'komada',
                    contactForPricing: 'Kontaktirajte za cijenu',
                    addToCart: 'Dodaj u košaricu',
                    requestQuote: 'Zatraži ponudu',
                    viewDetails: 'Pogledaj detalje',
                    signInToOrder: 'Prijavite se za narudžbu',
                    noProducts: 'Nema proizvoda',
                    noProductsText: 'Trenutno nema dostupnih partnerskih proizvoda.',
                    availableForPartners: 'Dostupno samo partnerima'
                },
                offers: {
                    title: 'Ponude za partnere',
                    subtitle: 'Ekskluzivne ponude i popusti za naše partnere',
                    currentHighlights: 'Trenutni istaknuti sadržaj',
                    loginRequired: 'Potrebna je prijava da biste vidjeli ponude',
                    loginToViewOffers: 'Prijavite se za pregled ponuda',
                    loginToViewPrices: 'Prijavite se za pregled cijena',
                    partnerOnly: 'Samo za partnere',
                    expires: 'Istječe',
                    savings: 'Ušteda',
                    couponCode: 'Kod kupona',
                    copy: 'Kopiraj',
                    claimOffer: 'Zatražite ponudu',
                    expired: 'Isteklo',
                    signInToClaim: 'Prijavite se za zahtjev',
                    viewDetails: 'Pogledaj detalje',
                    noOffers: 'Nema ponuda',
                    noOffersText: 'Trenutno nema dostupnih partnerskih ponuda.',
                    bulkDiscount: 'Količinski popust',
                    limitedTime: 'Ograničeno vrijeme',
                    contactForDetails: 'Kontaktirajte za detalje'
                }
            },
            // Admin Company Management
            adminCompany: {
                title: 'Upravljanje tvrtkama',
                subtitle: 'Pregled i upravljanje zahtjevima za partnerstvo',
                pendingApproval: 'Čeka odobrenje',
                approved: 'Odobreno',
                rejected: 'Odbačeno',
                companyName: 'Naziv tvrtke',
                contactPerson: 'Kontakt osoba',
                businessType: 'Vrsta poslovanja',
                status: 'Status',
                actions: 'Akcije',
                view: 'Prikaži',
                approve: 'Odobri',
                reject: 'Odbaci',
                edit: 'Uredi',
                delete: 'Obriši',
                companyDetails: 'Detalji tvrtke',
                personalInfo: 'Osobni podaci',
                companyInfo: 'Podaci o tvrtki',
                approveCompany: 'Odobri tvrtku',
                rejectCompany: 'Odbaci tvrtku',
                confirmApprove: 'Jeste li sigurni da želite odobriti ovu tvrtku?',
                confirmReject: 'Jeste li sigurni da želite odbaciti ovu tvrtku?',
                confirmDelete: 'Jeste li sigurni da želite obrisati ovu tvrtku?',
                companyApproved: 'Tvrtka je odobrena',
                companyRejected: 'Tvrtka je odbačena',
                companyDeleted: 'Tvrtka je obrisana',
                noCompanies: 'Nema tvrtki',
                noCompaniesText: 'Trenutno nema zahtjeva za partnerstvo.'
            },
            // Admin Panel
            admin: {
                dashboard: 'Nadzorna ploča',
                products: 'Proizvodi',
                categories: 'Kategorije',
                blog: 'Blog postovi',
                offers: 'Ponude',
                users: 'Korisnici',
                orders: 'Narudžbe',
                reviews: 'Recenzije',
                companyPricing: 'Cijene za tvrtke',
                companies: 'Tvrtke',
                wishlist: 'Lista želja',
                manageOffers: 'Upravljanje ponudama',
                manageProducts: 'Upravljanje proizvodima',
                manageUsers: 'Upravljanje korisnicima',
                manageOrders: 'Upravljanje narudžbama',
                contentManagement: 'Upravljanje sadržajem',
                systemManagement: 'Upravljanje sustavom',
                language: 'Jezik',
                // Order management
                orderNumber: 'Narudžba broj',
                orderDetailsAndLineItems: 'Detalji narudžbe i stavke',
                editOrder: 'Uredi narudžbu',
                totalAmount: 'Ukupan iznos',
                items: 'Stavke',
                orderDate: 'Datum narudžbe',
                paymentMethod: 'Način plaćanja',
                creditCard: 'Kreditna kartica',
                customerInformation: 'Informacije o kupcu',
                billingAddress: 'Adresa za naplatu',
                shippingAddress: 'Adresa za dostavu',
                orderItems: 'Stavke narudžbe',
                addItem: 'Dodaj stavku',
                productName: 'Naziv proizvoda',
                unitPrice: 'Jedinična cijena',
                quantity: 'Količina',
                discountPercent: 'Popust %',
                subtotal: 'Iznos',
                noItemsInOrder: 'Nema stavki u narudžbi',
                addItemsToOrder: 'Dodajte stavke u narudžbu',
                addFirstItem: 'Dodaj prvu stavku',
                orderDiscount: 'Popust na narudžbu',
                orderDiscountPercent: 'Popust na narudžbu %',
                orderSummary: 'Sažetak narudžbe',
                itemDiscounts: 'Popusti na stavke',
                shipping: 'Dostava',
                tax: 'Porez',
                total: 'Ukupno',
                printInvoice: 'Ispiši račun',
                saveChanges: 'Spremi promjene',
                orderNotFound: 'Narudžba nije pronađena',
                goBack: 'Idi natrag',
                // Offer management
                offerDetailsAndProducts: 'Detalji ponude i proizvodi',
                editOffer: 'Uredi ponudu',
                active: 'Aktivno',
                inactive: 'Neaktivno',
                type: 'Tip',
                discountType: 'Tip popusta',
                discountValue: 'Vrijednost popusta',
                minPurchase: 'Min. kupnja',
                offerTimeline: 'Raspored ponude',
                startDate: 'Datum početka',
                endDate: 'Datum završetka',
                usageLimit: 'Ograničenje korištenja',
                unlimited: 'Neograničeno',
                productsInOffer: 'Proizvodi u ponudi',
                addProduct: 'Dodaj proizvod',
                category: 'Kategorija',
                originalPrice: 'Originalna cijena',
                finalPrice: 'Konačna cijena',
                noProductsAssigned: 'Nema dodijeljenih proizvoda',
                addProductsToOffer: 'Dodajte proizvode u ponudu',
                addFirstProduct: 'Dodaj prvi proizvod',
                offerSummary: 'Sažetak ponude',
                totalOriginal: 'Ukupno originalno',
                totalDiscounted: 'Ukupno s popustom',
                totalSavings: 'Ukupna ušteda',
                termsConditions: 'Uvjeti i odredbe',
                offerNotFound: 'Ponuda nije pronađena'
            },
            // Admin Users
            adminUsers: {
                createUser: 'Stvori korisnika',
                editUser: 'Uredi korisnika',
                manageUserAccounts: 'Upravljaj korisničkim računima i profilima',
                personalInformation: 'Osobni podaci',
                profileInformation: 'Informacije o profilu',
                addressInformation: 'Informacije o adresi',
                firstName: 'Ime',
                lastName: 'Prezime',
                email: 'Email',
                phone: 'Telefon',
                avatarUrl: 'URL avatara',
                role: 'Uloga',
                dateOfBirth: 'Datum rođenja',
                bio: 'Biografija',
                streetAddress: 'Adresa',
                city: 'Grad',
                state: 'Županija',
                postalCode: 'Poštanski broj',
                country: 'Zemlja',
                firstNameRequired: 'Ime je obavezno',
                lastNameRequired: 'Prezime je obavezno',
                emailRequired: 'Email je obavezan',
                validEmailRequired: 'Molimo unesite valjan email',
                roleRequired: 'Uloga je obavezna',
                selectRole: 'Odaberite ulogu',
                roleUser: 'Korisnik',
                roleAdmin: 'Administrator',
                roleModerator: 'Moderator'
            },
            // Admin Company Pricing
            adminCompanyPricing: {
                createPricing: 'Stvori cijenu',
                editPricing: 'Uredi cijenu',
                setPriceForCompany: 'Postavite prilagođenu cijenu proizvoda za tvrtku',
                pricingDetails: 'Detalji cijena',
                companyId: 'ID tvrtke',
                productId: 'ID proizvoda',
                price: 'Cijena',
                companyIdRequired: 'ID tvrtke je obavezan',
                productIdRequired: 'ID proizvoda je obavezan',
                priceRequired: 'Cijena je obavezna',
                priceMinimum: 'Cijena mora biti pozitivna',
                priceDescription: 'Unesite prilagođenu cijenu u eurima za ovaj proizvod i tvrtku',
                additionalInfo: 'Dodatne informacije',
                importantNotes: 'Važne napomene',
                note1: 'Prilagođene cijene imaju prednost nad standardnim cijenama',
                note2: 'Promjene se odmah primjenjuju na sve buduće narudžbe',
                note3: 'Kontaktirajte tvrtku prije mijenjanja postojećih cijena'
            },
            // Reviews
            reviewsSection: {
                customerReviews: 'Recenzije kupaca',
                basedOnReviews: 'Na temelju {{count}} recenzija',
                ratingBreakdown: 'Razpodjela ocjena',
                writeReview: 'Napiši recenziju',
                verifiedPurchase: 'Potvrđena kupnja',
                helpful: 'Korisno',
                report: 'Prijavi',
                loadMoreReviews: 'Učitaj više recenzija',
                noReviewsYet: 'Još nema recenzija',
                beFirstToReview: 'Budite prvi koji će recenzirati ovaj proizvod',
                writeFirstReview: 'Napiši prvu recenziju'
            },
            // Profile
            profile: {
                profile: 'Profil',
                adminDashboard: 'Admin panel',
                signOut: 'Odjavite se',
                myProfile: 'Moj profil',
                manageAccount: 'Upravljajte postavkama računa i preferencijama',
                profileUpdated: 'Profil je uspješno ažuriran!',
                updateError: 'Došlo je do greške prilikom ažuriranja profila.',
                userInfo: 'Korisničke informacije',
                billingShipping: 'Naplata i dostava',
                personalInformation: 'Osobne informacije',
                updatePersonalDetails: 'Ažurirajte svoje osobne podatke i kontakt informacije',
                changePhoto: 'Promijeni fotografiju',
                photoRequirements: 'JPG, GIF ili PNG. Maksimalno 1MB.',
                firstName: 'Ime',
                lastName: 'Prezime',
                emailAddress: 'Email adresa',
                phoneNumber: 'Broj telefona',
                dateOfBirth: 'Datum rođenja',
                gender: 'Spol',
                selectGender: 'Odaberite spol',
                male: 'Muški',
                female: 'Ženski',
                other: 'Ostalo',
                preferNotToSay: 'Radije ne bih rekao',
                saveChanges: 'Spremi promjene',
                saving: 'Spremanje...',
                firstNameRequired: 'Ime je obavezno',
                lastNameRequired: 'Prezime je obavezno',
                validEmailRequired: 'Molimo unesite valjanu email adresu',
                enterFirstName: 'Unesite svoje ime',
                enterLastName: 'Unesite svoje prezime',
                enterEmailAddress: 'Unesite svoju email adresu',
                enterPhoneNumber: 'Unesite svoj broj telefona',
                addresses: 'Adrese',
                manageBillingShipping: 'Upravljajte adresama za naplatu i dostavu',
                addAddress: 'Dodaj adresu',
                default: 'Zadano',
                edit: 'Uredi',
                delete: 'Obriši',
                noAddressesFound: 'Nema pronađenih adresa',
                addFirstAddress: 'Dodajte svoju prvu adresu za početak',
                paymentMethods: 'Načini plaćanja',
                manageSavedPayment: 'Upravljajte spremljenim načinima plaćanja',
                addPaymentMethod: 'Dodaj način plaćanja',
                noPaymentMethodsFound: 'Nema pronađenih načina plaćanja',
                addFirstPayment: 'Dodajte svoj prvi način plaćanja za početak',
                myOrders: 'Moje narudžbe',
                viewOrderHistory: 'Pregledajte svoju povijest narudžbi',
                viewDetails: 'Prikaži detalje',
                writeReview: 'Napišite recenziju',
                trackOrder: 'Pratite narudžbu',
                noOrdersFound: 'Nema pronađenih narudžbi',
                startShopping: 'Počnite s kupovinom da biste vidjeli svoje narudžbe ovdje',
                browseProducts: 'Pregledajte proizvode',
                myWishlist: 'Moja lista želja',
                viewWishlistItems: 'Pregledajte proizvode na svojoj listi želja',
                noWishlistItems: 'Nema proizvoda na listi želja',
                startAddingToWishlist: 'Počnite dodavati proizvode na svoju listu želja',
                addToCart: 'Dodaj u košaricu',
                addToWishlist: 'Dodaj na listu želja',
                removeFromWishlist: 'Ukloni s liste želja',
                addedToWishlist: 'Dodano na listu želja!',
                removedFromWishlist: 'Uklonjeno s liste želja!',
                alreadyInWishlist: 'Proizvod je već na listi želja',
                addToWishlistError: 'Greška prilikom dodavanja na listu želja',
                removeFromWishlistError: 'Greška prilikom uklanjanja s liste želja',
                freeShipping: 'Besplatna dostava',
                myReviews: 'Moje recenzije',
                manageReviews: 'Upravljajte svojim recenzijama i pogledajte odgovore admina',
                verifiedPurchase: 'Potvrđena kupnja',
                adminResponse: 'Odgovor administratora',
                editReview: 'Uredi recenziju',
                deleteReview: 'Obriši recenziju',
                noReviewsFound: 'Nema pronađenih recenzija',
                writeFirstReview: 'Napišite svoju prvu recenziju nakon kupovine proizvoda'
            },
            // Common
            common: {
                loading: 'Učitavanje...',
                error: 'Greška',
                success: 'Uspjeh',
                save: 'Spremi',
                cancel: 'Otkaži',
                delete: 'Obriši',
                edit: 'Uredi',
                view: 'Prikaži',
                close: 'Zatvori',
                search: 'Traži',
                filter: 'Filtriraj',
                sort: 'Sortiraj',
                next: 'Sljedeće',
                previous: 'Prethodno',
                page: 'Stranica',
                of: 'od',
                noResults: 'Nema rezultata',
                tryAgain: 'Pokušajte ponovno',
                clear: 'Obriši'
            },
            // Contact Information
            contact: {
                phone: '+385 1 234 5678',
                email: 'info@solarshop.hr'
            },
            // Language
            language: {
                current: 'Hrvatski'
            },
            // Hero Section
            hero: {
                mainTitle: 'Vaša destinacija za solarnu energiju',
                subtitle: 'Kupujte visokokvalitetne solarne panele, invertere, baterije i opremu. Sve što trebate za vlastiti sustav solarne energije na jednom mjestu.',
                exploreProducts: 'Istražite proizvode',
                exploreOffers: 'Istražite ponude',
                loading: 'Učitavanje...',
                noOffersAvailable: 'Trenutno nema dostupnih ponuda',
                primeDeal: 'Hit Ponuda'
            },
            // Products
            products: {
                title: 'Proizvodi',
                subtitle: 'Otkrijte naš široki asortiman proizvoda za održivu i energetski učinkovitu gradnju',
                exploreProducts: 'Istražite proizvode',
                productsCount: '{{count}} proizvoda',
                needHelp: 'Trebate pomoć u odabiru?',
                needHelpText: 'Naši stručnjaci su tu da vam pomognu pronaći savršene proizvode za vaš projekt. Zatražite personalizirane preporuke već danas.',
                contactExperts: 'Kontaktirajte naše stručnjake',
                noCategories: 'Nema dostupnih kategorija proizvoda',
                noCategoriesText: 'Provjerite kasnije za naše kategorije proizvoda.'
            },
            // Offers
            offers: {
                title: 'Posebne ponude',
                subtitle: 'Otkrijte nevjerojatne uštede na solarnim sustavima i komponentama',
                allCategories: 'Sve kategorije',
                solarPanels: 'Solarni paneli',
                inverters: 'Pretvarači',
                batteries: 'Baterije',
                accessories: 'Pribor',
                offersAvailable: '{{count}} ponuda dostupno',
                sale: 'RASPRODAJA',
                youSave: 'Štedite {{amount}}',
                addToCart: 'Dodaj u košaricu',
                viewDetails: 'Pogledaj detalje',
                noOffers: 'Nema dostupnih ponuda',
                noOffersText: 'Trenutno nema aktivnih ponuda. Provjerite našu ponudu proizvoda.',
                browseAllProducts: 'Pregledaj sve proizvode',
                dontMissOut: 'Ne propustite!',
                subscribeText: 'Pretplatite se na naš newsletter i budite prvi koji će saznati o novim ponudama.',
                enterEmail: 'Unesite vaš email',
                subscribe: 'Pretplati se',
                viewAll: 'Pogledaj sve'
            },
            // Mission/Sustainability
            mission: {
                title: 'Održivost',
                subtitle: 'U SolarShop vjerujemo da gradnja i renoviranje ne znači samo stvaranje udobnih i funkcionalnih prostora, već i brigu o okolišu u kojem živimo.',
                ourPhilosophy: 'Naša filozofija',
                environmentalResponsibility: 'Odgovornost prema okolišu',
                environmentalText: 'Svaki proizvod koji nudimo pažljivo je ocijenjen po pitanju utjecaja na okoliš, od faze proizvodnje do konačnog uklanjanja.',
                qualityDurability: 'Kvaliteta i trajnost',
                qualityText: 'Trajni i otporni materijali smanjuju otpad i česte intervencije, pružajući održivija i ekonomičnija rješenja kroz vrijeme.',
                technologicalInnovation: 'Tehnološka inovacija',
                innovationText: 'Surađujemo s dobavljačima i markama koji ulažu u istraživanje i razvoj, fokusirajući se na najnapredniju tehnologiju i materijale malog utjecaja na okoliš.',
                commitmentBeyond: 'Naša predanost izvan proizvoda',
                personalizedConsulting: 'Personalizirano savjetovanje',
                consultingText: 'Pomažemo našim kupcima identificirati prilagođena rješenja za efikasniju i manje utjecajnu gradnju, pružajući konkretne prijedloge i smjernice.',
                continuousUpdates: 'Kontinuirana ažuriranja i istraživanja',
                updatesText: 'Neprestano pratimo inovacije u industriji i nove propise, kako bismo uvijek ponudili najbolju tehnologiju i najčasnija praksa.',
                awarenessEducation: 'Svijest i obrazovanje',
                educationText: 'Kroz naš blog, vodiče i uslugu podrške, nudimo korisne informacije za razumijevanje prednosti održivosti i prednosti ulaganja u certificirane proizvode.',
                materialSelection: 'Kako biramo materijale',
                rawMaterialsAnalysis: 'Analiza sirovina',
                rawMaterialsText: 'Dajemo prioritet obnovljivim, recikliranim ili reciklabilnim materijalima, izbjegavajući tvari štetne za zdravlje i ekosustav.',
                certificationEvaluation: 'Evaluacija certifikata',
                certificationText: 'Prije predlaganja proizvoda, provjeravamo njegove certifikate za okoliš i kvalitetu, kao što su LEED, CasaClima, FSC, PEFC ili ISO 14001.',
                energyEfficiency: 'Energetska učinkovitost',
                efficiencyText: 'Biramo proizvode i rješenja koja poboljšavaju toplinsku izolaciju, smanjuju potrošnju i pogoduju korištenju obnovljivih izvora energije.',
                subscribeNewsletter: 'Pretplatite se na naš newsletter',
                subscribe: 'Pretplatite se',
                callToAction: 'Zajedno možemo izgraditi budućnost u kojoj udobnost, kvaliteta, učinkovitost i poštovanje okoliša idu ruku pod ruku. Odabirom SolarShop-a, odlučujete doprinijeti zdravijem, uravnoteženjem i svjesnijem svijetu.'
            },
            // Sustainability Section
            sustainability: {
                energyEfficiencySuggestions: 'Prijedlozi za energetsku učinkovitost',
                energyEfficiencySuggestionsText: 'Vodiči za toplinsku izolaciju, smanjenje potrošnje i sustave obnovljive energije.',
                greenCertifications: 'Zeleni certifikati i standardi',
                greenCertificationsText: 'Pregled certifikata (LEED, ISO 14001, itd.)',
                reducedEnvironmentalImpact: 'Proizvodi smanjenog utjecaja na okoliš',
                reducedEnvironmentalImpactText: 'Odabir rješenja usmjerenih na održivost i recikliranje.',
                sustainableMaterials: 'Održivi materijali',
                sustainableMaterialsText: 'Certificirani proizvodi malog utjecaja.',
                towardsSustainability: 'Prema održivosti'
            },
            // Blog
            blog: {
                title: 'Blog i članci',
                subtitle: 'Najnovije vijesti, savjeti i uvidi iz svijeta solarne energije',
                allPosts: 'Svi postovi',
                loading: 'Učitavanje...',
                unableToLoad: 'Nije moguće učitati članke',
                tryAgain: 'Pokušaj ponovno',
                featured: 'Istaknuto',
                loadMore: 'Učitaj više',
                noPosts: 'Nema članaka',
                noPostsText: 'Trenutno nema dostupnih članaka. Provjerite kasnije.',
                readMore: 'Čitaj više',
                viewAllPosts: 'Pogledaj sve članke',
                recentProjects: 'Najnoviji projekti i uvidi',
                recentProjectsSubtitle: 'Otkrijte najnovije solar projekte, tehnične uvide i stručne savjete našeg tima',
                relatedArticles: 'Povezani članci',
                stayUpdated: 'Ostanite u toku',
                newsletterText: 'Pretplatite se na naš newsletter i budite prvi koji će saznati o najnovijim člancima i solarnim rješenjima.',
                articleNotFound: 'Članak nije pronađen',
                backToBlog: 'Natrag na blog',
                whatYouFind: 'Što ćete pronaći',
                technicalGuides: 'Tehnički vodiči',
                technicalGuidesText: 'Detaljni vodiči za instalaciju, održavanje i optimizaciju solarnih sustava.',
                regulationsInsights: 'Uvidi u propise',
                regulationsText: 'Najnovije informacije o solarnim poticajima, zakonima i regulativama.',
                sustainabilityTips: 'Savjeti za održivost',
                sustainabilityText: 'Praktični savjeti za zelji život i maksimalizaciju energetske učinkovitosti.',
                caseStudies: 'Studije slučaja',
                caseStudiesText: 'Stvarni primjeri uspješnih solarnih instalacija i njihovih rezultata.',
                faqTutorials: 'FAQ i tutorijali',
                faqText: 'Odgovori na najčešća pitanja i korak-po-korak tutorijali.',
                trustedPartner: 'Vaš pouzdani partner',
                partnerText: 'Više od 10 godina iskustva u solarnoj industriji. Naš tim stručnjaka dijeli znanje kroz informativne članke koji vam pomažu donijeti prave odluke.'
            },
            // Company
            company: {
                title: 'Naša kompanija',
                subtitle: 'Dobrodošli u sekciju posvećenu našoj kompaniji. Ovdje možete saznati više o nama, našoj povijesti, vrijednostima i timu.',
                whoWeAre: 'Tko smo mi',
                whoWeAreText: 'SolarShop je nastao iz iskustva profesionalaca u građevinskom sektoru koji su, kombiniranjem svojih vještina, odlučili stvoriti portal.',
                mission: 'Naša misija je jednostavna: učiniti dostupnim svima najnovija rješenja za održivu gradnju.',
                ourTeam: 'Naš tim',
                teamText: 'Iza SolarShop-a je grupa strastvenih i kompetentnih ljudi: inženjeri, arhitekti, energetski savjetnici i građevinski profesionalci.',
                missionValues: 'Misija i vrijednosti',
                quality: 'Kvaliteta',
                qualityText: 'Nudimo samo testirane i certificirane proizvode, odabrane od najpouzdanijih marki na tržištu.',
                innovation: 'Inovacija',
                innovationText: 'Fokusiramo se na najnapredniju tehnologiju i materijale najnovije generacije.',
                sustainability: 'Održivost',
                sustainabilityText: 'Poštujemo planet, birajući materijale malog utjecaja, potičući korištenje obnovljivih energija.',
                support: 'Podrška',
                supportText: 'Pratimo vas u svakoj fazi, od odabira proizvoda do postprodajne pomoći.',
                suppliersPartners: 'Dobavljači i partneri',
                partnersText: 'Surađujemo s najutvrđenijim markama i specijaliziranim kompanijama.',
                socialResponsibility: 'Društvena i ekološka odgovornost',
                responsibilityText: 'Naša predanost ne prestaje na proizvodu. Predani smo promicanju kulture održivosti.'
            },
            // Cart
            cart: {
                title: 'Vaša košarica',
                empty: 'Vaša košarica je prazna!',
                emptyText: 'Dodajte proizvode za početak kupovine.',
                continueShopping: 'Nastavite kupovinu',
                remove: 'Ukloni',
                discountCode: 'Kod za popust',
                enterDiscountCode: 'Unesite kod za popust',
                apply: 'Primijeni',
                subtotal: 'Iznos',
                tax: 'Porez',
                shipping: 'Dostava',
                discount: 'Popust',
                total: 'Ukupno',
                proceedToCheckout: 'Nastavi na naplatu',
                itemAddedToCart: 'Proizvod dodan u košaricu!',
                adding: 'Dodavanje...',
                openCart: 'Otvori košaricu',
                freeShipping: 'Besplatna dostava',
                freeShippingProgress: 'Dodajte još {{amount}} za besplatnu dostavu!',
                freeShippingRemaining: 'Dodajte {{amount}} za besplatnu dostavu!',
                yourCart: 'Vaša košarica',
                checkout: 'Naplata'
            },
            // Checkout
            checkout: {
                title: 'Naplata',
                completeOrder: 'Dovršite svoju narudžbu',
                step1: 'Pregled narudžbe',
                step2: 'Informacije o dostavi',
                step3: 'Način plaćanja',
                orderSummary: 'Sažetak narudžbe',
                subtotal: 'Iznos',
                tax: 'Porez',
                total: 'Ukupno',
                personalInfo: 'Osobne informacije',
                firstName: 'Ime',
                firstNameRequired: 'Ime je obavezno',
                lastName: 'Prezime',
                email: 'Email',
                phone: 'Telefon',
                shippingAddress: 'Adresa dostave',
                address: 'Adresa',
                city: 'Grad',
                postalCode: 'Poštanski broj',
                country: 'Država',
                paymentMethod: 'Način plaćanja',
                creditCard: 'Kreditna kartica',
                paypal: 'PayPal',
                payOnDelivery: 'Plaćanje pouzećem',
                bankTransfer: 'Bankovni transfer',
                cardNumber: 'Broj kartice',
                expiryDate: 'Datum isteka',
                cvv: 'CVV',
                placeOrder: 'Naruči',
                processing: 'Obrađujemo...',
                orderPlaced: 'Narudžba je uspješno poslana!',
                orderNumber: 'Broj narudžbe: {{number}}',
                orderCompletedSuccessfully: 'Narudžba je uspješno dovršena!',
                orderCreated: 'Narudžba #{{number}} je kreirana i čeka na pregled.',
                backStep: 'Nazad na',
                nextStep: 'Nastavi na'
            },
            // Footer
            footer: {
                companyDescription: 'Vaša destinacija za održive građevinske materijale i rješenja energetske učinkovitosti. Izgradimo zeleniju budućnost zajedno.',
                address: 'Ilica 1, 10000 Zagreb, Hrvatska',
                phone: '+385 1 234 5678',
                email: 'info@solarshop.hr',
                hours: 'Pon-Pet: 8:00-17:00',
                followUs: 'Pratite nas:',
                newsletter: 'Newsletter',
                newsletterDescription: 'Budite u toku s najnovijim proizvodima i ponudama.',
                subscribe: 'Pretplatite se',
                yourEmail: 'Vaš email',
                copyright: 'Copyright',
                allRightsReserved: 'Sva prava pridržana.',
                privacyPolicy: 'Pravila privatnosti',
                termsOfService: 'Uvjeti korištenja',
                cookiePolicy: 'Pravila kolačića',
                isoCertified: 'ISO 14001 certificirano',
                sustainable: '100% održivo'
            },
            // Product Reviews
            reviews: {
                customerReviews: 'Recenzije kupaca',
                basedOnReviews: 'Na temelju {{count}} recenzija',
                writeReview: 'Napišite recenziju',
                verifiedPurchase: 'Potvrđena kupnja',
                helpful: 'Korisno ({{count}})',
                report: 'Prijavite',
                loadMoreReviews: 'Učitaj više recenzija',
                excellentQuality: 'Izvrsna kvaliteta i performanse',
                goodValue: 'Dobra vrijednost za novac',
                highlyRecommended: 'Toplo preporučujem!',
                solidProduct: 'Solidan proizvod',
                outstandingService: 'Izvanredna korisnička služba'
            },
            // Search
            search: {
                searchProducts: 'Pretraži proizvode',
                search: 'Pretraži',
                placeholder: 'Unesite naziv ili opis proizvoda...',
                searchByName: 'Pretraži po nazivu ili opisu...',
                suggestions: 'Prijedlozi',
                clear: 'Obriši',
                solarPanels: 'Solarni paneli',
                inverters: 'Pretvarači',
                batteries: 'Baterije',
                mountingSystems: 'Sustavi za montažu',
                cables: 'Kabeli'
            },
            // Contact & Support
            contactSupport: {
                title: 'Kontakti i pomoć',
                subtitle: 'Trebate pomoć ili želite više informacija? Mi smo tu za vas. Odjel Kontakti i pomoć SolarShop-a dizajniran je da vam pruži svu podršku koju trebate, od odabira proizvoda do postprodajne podrške, osiguravajući jednostavno, transparentno i sigurno iskustvo kupovine.',
                contactForm: 'Kontaktni obrazac',
                contactFormText: 'Ispunite online obrazac na ovoj stranici, unesite svoje podatke i prirodu zahtjeva. Član našeg osoblja će vas uskoro kontaktirati.',
                name: 'Ime',
                lastName: 'Prezime',
                email: 'Email',
                message: 'Poruka',
                typeMessage: 'Upišite vašu poruku ovdje...',
                sendMessage: 'Pošaljite poruku',
                sending: 'Šalje se...',
                postSaleAssistance: 'POSTPRODAJNA POMOĆ',
                postSaleAssistanceText: 'Nakon što završite s kupovinom, ne ostavljamo vas same. Imate pitanja o proizvodima koje ste primili, rokovima dostave ili načinima ugradnje? Naša usluga postprodajne pomoći na vašoj je dispoziciji za:',
                detailedProductInfo: 'Pružiti detaljne informacije o proizvodima koje ste odabrali.',
                installationGuidance: 'Voditi vas u ugradnji ili korištenju materijala.',
                issueResolution: 'Pomoći vam s bilo kojim problemima, osiguravajući brza i učinkovita rješenja.',
                technicalSupport: 'Tehnička podrška i izložbeni salon',
                technicalSupportText: 'Ako želite direktniji kontakt, ili ako vaš projekt zahtijeva specifičnu tehničku podršku, možete posjetiti jedan od naših centara za pomoć, gdje možete razgovarati s našim stručnjacima i vidjeti proizvode izbliza.',
                returnsShipping: 'Politika povrata i dostave',
                returnsShippingText: 'Konzultirajte naš odjel posvećen Politici povrata i dostave da biste saznali o postupcima povrata, rokovima dostave i uvjetima za bilo kakve povrate novca. Uvijek smo transparentni, tako da možete kupovati s povjerenjem znajući da se možete osloniti na nas u slučaju promjena ili problema.',
                learnMore: 'Saznajte više',
                faq: 'FAQ',
                faqQuestion1: 'Koje usluge nudi SolarShop?',
                faqAnswer1: 'SolarShop nudi širok spektar usluga, uključujući energetske preglede, energetsko modeliranje, ugradnju visokoefikasnih sustava, integraciju obnovljive energije, poboljšanja omotača zgrade, nadogradnje mehaničkih sustava, nadogradnje električnih sustava, nadogradnje vodovodnih sustava i sveobuhvatno upravljanje projektima.',
                faqQuestion2: 'Za koga su namijenjene vaše usluge?',
                faqAnswer2: 'Naše usluge namijenjene su vlasnicima kuća, poduzećima i izvođačima koji žele poboljšati energetsku učinkovitost, smanjiti troškove i implementirati održiva građevinska rješenja.',
                faqQuestion3: 'Kako mi fotonaponski sustavi mogu koristiti?',
                faqAnswer3: 'Fotonaponski sustavi mogu značajno smanjiti vaše račune za struju, povećati vrijednost vaše nekretnine, pružiti energetsku neovisnost i doprinijeti održivosti okoliša smanjenjem vašeg ugljičnog otiska.',
                faqQuestion4: 'Što je toplinski omotač i zašto je važan?',
                faqAnswer4: 'Toplinski omotač odnosi se na izolaciju zgrade koja omataju vašu kuću poput jakne, sprječavajući gubitak topline zimi i dobit topline ljeti. To poboljšava energetsku učinkovitost i udobnost uz smanjenje troškova grijanja i hlađenja.',
                faqQuestion5: 'Jesu li vaša energetska rješenja ekološki prihvatljiva?',
                faqAnswer5: 'Da, sva naša energetska rješenja dizajnirana su s mišlju na održivost. Fokusiramo se na obnovljive izvore energije, energetski učinkovite tehnologije i ekološki odgovorne materijale i prakse.',
                faqQuestion6: 'Možete li upravljati potpunim renovacijama?',
                faqAnswer6: 'Apsolutno! Pružamo sveobuhvatno upravljanje projektima za potpune renovacije, rješavajući sve od početnog planiranja i dozvola do konačne ugradnje i osiguranja kvalitete.',
                bottomCta: 'Kakva god da je vaša potreba, tim SolarShop-a spreman je pomoći Vam. Kontaktirajte nas danas i pustite da vas vodimo prema rješenju najprikladnijem vašim potrebama. Gradnja ili renoviranje nikad nije bilo lakše, sigurnije i zadovoljnije.'
            },
            // Product List
            productList: {
                title: 'Proizvodi',
                subtitle: 'Otkrijte naša održiva građevinska rješenja',
                filters: 'Filteri',
                categories: 'Kategorije',
                priceRange: 'Raspon cijena',
                min: 'Min',
                max: 'Max',
                manufacturer: 'Proizvođač',
                clearAllFilters: 'Obriši sve filtere',
                productsFound: '{{count}} proizvoda pronađeno',
                sortBy: 'Sortiraj po:',
                featured: 'Istaknuto',
                newestArrivals: 'Najnoviji dolasci',
                nameAZ: 'Ime A - Z',
                nameZA: 'Ime Z - A',
                priceLowHigh: 'Cijena niska do visoka',
                priceHighLow: 'Cijena visoka do niska',
                available: 'Dostupno',
                limited: 'Ograničeno',
                outOfStock: 'Nema na skladištu',
                addToCart: 'Dodaj u košaricu',
                reviews: 'recenzija',
                noProductsFound: 'Nema pronađenih proizvoda',
                adjustFilters: 'Pokušajte prilagoditi filtere da biste vidjeli više rezultata.'
            },
            // Product Details
            productDetails: {
                home: 'Početna',
                products: 'Proizvodi',
                productDetails: 'Detalji proizvoda',
                productNotFound: 'Proizvod nije pronađen',
                backToProducts: 'Natrag na proizvode',
                relatedProducts: 'Povezani proizvodi',
                relatedProductsComingSoon: 'Povezani proizvodi uskoro...',
                // Product Info
                availability: 'Dostupnost',
                inStock: 'Na skladištu',
                limitedStock: 'Ograničeno na skladištu',
                outOfStock: 'Nema na skladištu',
                priceIncludesVat: 'Cijena uključuje PDV. Besplatna dostava za narudžbe preko €500.',
                description: 'Opis',
                specifications: 'Specifikacije proizvoda',
                category: 'Kategorija',
                manufacturer: 'Proizvođač',
                sku: 'SKU',
                quantity: 'Količina',
                addToCart: 'Dodaj u košaricu',
                addToWishlist: 'Dodaj na listu želja',
                removeFromWishlist: 'Ukloni s liste želja',
                addedToWishlist: 'Dodano na listu želja!',
                removedFromWishlist: 'Uklonjeno s liste želja!',
                alreadyInWishlist: 'Proizvod je već na listi želja',
                addToWishlistError: 'Greška prilikom dodavanja na listu želja',
                removeFromWishlistError: 'Greška prilikom uklanjanja s liste želja',
                freeShipping: 'Besplatna dostava',
                twoYearWarranty: '2 godine jamstva',
                easyReturns: 'Jednostavan povrat',
                // Product Photos
                zoomImage: 'Povećaj sliku'
            },
            // Privacy Policy
            privacyPolicy: {
                title: 'Pravila privatnosti',
                subtitle: 'Kako prikupljamo, koristimo i štitimo vaše osobne podatke',
                lastUpdated: 'Zadnje ažurirano: siječanj 2024.',
                informationWeCollect: {
                    title: 'Informacije koje prikupljamo',
                    intro: 'Prikupljamo informacije koje nam izravno pružate, kao i informacije koje automatski prikupljamo kada koristite naše usluge.',
                    personalInfo: {
                        title: 'Osobni podaci',
                        name: 'Ime i kontaktni podaci',
                        email: 'Email adresa',
                        phone: 'Broj telefona',
                        address: 'Adrese za naplatu i dostavu',
                        payment: 'Podaci o plaćanju'
                    },
                    automaticInfo: {
                        title: 'Automatski prikupljene informacije',
                        ip: 'IP adresa i podaci o uređaju',
                        browser: 'Tip i verzija preglednika',
                        device: 'Tip uređaja i operacijski sustav',
                        usage: 'Obrasci korištenja i preferencije',
                        cookies: 'Kolačići i slične tehnologije'
                    }
                },
                howWeUse: {
                    title: 'Kako koristimo vaše informacije',
                    processOrders: 'Obrađujemo i ispunjavamo vaše narudžbe',
                    customerService: 'Pružamo korisničku službu i podršku',
                    communication: 'Šaljemo vam važne obavijesti i komunikacije',
                    marketing: 'Šaljemo marketinške komunikacije (uz pristanak)',
                    analytics: 'Poboljšavamo naše usluge kroz analitiku',
                    legal: 'Poštujemo pravne obveze'
                },
                sharing: {
                    title: 'Dijeljenje informacija',
                    intro: 'Ne prodajemo, trgovimo ili iznajmljujemo vaše osobne podatke. Možemo podijeliti vaše informacije samo u sljedećim okolnostima:',
                    serviceProviders: 'S pouzdanim pružateljima usluga koji nam pomažu u poslovanju',
                    legal: 'Kada to zahtijeva zakon ili radi zaštite naših prava',
                    business: 'U vezi s poslovnom transakcijom',
                    consent: 'Uz vaš izričiti pristanak'
                },
                security: {
                    title: 'Sigurnost podataka',
                    description: 'Provodimo odgovarajuće sigurnosne mjere za zaštitu vaših osobnih podataka od neovlaštenog pristupa, mijenjanja, otkrivanja ili uništavanja.'
                },
                rights: {
                    title: 'Vaša prava',
                    access: 'Pristup vašim osobnim podacima',
                    correct: 'Ispravak netočnih informacija',
                    delete: 'Zahtjev za brisanje vaših informacija',
                    restrict: 'Ograničavanje obrade vaših informacija',
                    portability: 'Prenosivost podataka',
                    object: 'Prigovor obradi za izravni marketing'
                },
                contact: {
                    title: 'Kontaktirajte nas',
                    description: 'Ako imate pitanja o ovim Pravilima privatnosti, molimo kontaktirajte nas:',
                    email: {
                        label: 'Email',
                        value: 'privatnost@solarshop.hr'
                    },
                    phone: {
                        label: 'Telefon',
                        value: '+385 1 234 5678'
                    },
                    address: {
                        label: 'Adresa',
                        value: 'Ilica 1, 10000 Zagreb, Hrvatska'
                    }
                },
                changes: {
                    title: 'Promjene u ovim pravilima',
                    description: 'Možemo povremeno ažurirati ova Pravila privatnosti. Obavijestit ćemo vas o značajnim promjenama objavljivanjem nove politike na ovoj stranici.'
                }
            },
            // Terms of Service
            termsOfService: {
                title: 'Uvjeti korištenja',
                subtitle: 'Uvjeti i odredbe za korištenje naših usluga',
                lastUpdated: 'Zadnje ažurirano: siječanj 2024.',
                acceptance: {
                    title: 'Prihvaćanje uvjeta',
                    description: 'Pristupom i korištenjem ove web stranice prihvaćate i pristajete biti vezani uvjetima i odredbama ovog sporazuma.'
                },
                services: {
                    title: 'Opis usluga',
                    description: 'SolarShop pruža proizvode solarne energije i povezane usluge uključujući:',
                    products: 'Solarne ploče, izmjenjivače, baterije i pribor',
                    consultation: 'Energetsko savjetovanje i dizajn sustava',
                    installation: 'Profesionalne usluge instalacije',
                    support: 'Tehničku podršku i održavanje',
                    maintenance: 'Kontinuirano praćenje i održavanje sustava'
                },
                accounts: {
                    title: 'Korisnički računi',
                    description: 'Kada stvarate račun kod nas, morate pružiti točne i potpune informacije. Odgovorni ste za:',
                    accurate: 'Pružanje točnih i ažurnih informacija',
                    secure: 'Održavanje sigurnosti vašeg računa',
                    responsible: 'Sve aktivnosti koje se događaju pod vašim računom',
                    notify: 'Trenutno obavještavanje o bilo kakvoj neovlaštenoj uporabi'
                },
                orders: {
                    title: 'Narudžbe i plaćanje',
                    description: 'Sve narudžbe podliježu prihvaćanju i dostupnosti. Zadržavamo pravo odbiti ili otkazati bilo koju narudžbu.',
                    pricing: {
                        title: 'Cijene',
                        description: 'Sve cijene su navedene u EUR i uključuju primjenjive poreze osim ako nije drugačije navedeno.'
                    },
                    payment: {
                        title: 'Plaćanje',
                        description: 'Plaćanje mora biti primljeno prije slanja proizvoda. Prihvaćamo glavne kreditne kartice i bankovne transfere.'
                    }
                },
                shipping: {
                    title: 'Dostava i isporuka',
                    processing: 'Narudžbe se obrađuju u roku od 1-3 radna dana',
                    delivery: 'Vremena dostave variraju ovisno o lokaciji i dostupnosti proizvoda',
                    risk: 'Rizik od gubitka prelazi na vas nakon dostave',
                    damages: 'Pregledajte pakete pri dostavi i odmah prijavite štete'
                },
                returns: {
                    title: 'Povrati i refundacije',
                    description: 'Želimo da budete zadovoljni vašom kupovinom. Naša politika povrata uključuje:',
                    timeLimit: '30-dnevni rok za povrat većine proizvoda',
                    condition: 'Predmeti moraju biti u originalnom stanju i pakiranju',
                    authorization: 'Potrebna je autorizacija povrata prije slanja predmeta natrag',
                    refund: 'Refundacije se obrađuju u roku od 5-10 radnih dana'
                },
                warranties: {
                    title: 'Jamstva',
                    description: 'Proizvodi dolaze s jamstvima proizvođača. Pružamo dodatnu jamstvenu podršku kao ovlašteni diljer.'
                },
                liability: {
                    title: 'Ograničavanje odgovornosti',
                    description: 'Naša odgovornost je ograničena u najvećoj mjeri dozvoljenoj zakonom. Nismo odgovorni za neizravne, slučajne ili posledične štete.'
                },
                intellectual: {
                    title: 'Intelektualno vlasništvo',
                    description: 'Sav sadržaj na ovoj web stranici je zaštićen autorskim pravom i drugim pravima intelektualnog vlasništva. Ne smijete reproducirati ili distribuirati sadržaj bez dozvole.'
                },
                law: {
                    title: 'Mjerodavno pravo',
                    description: 'Ovi uvjeti su uređeni hrvatskim pravom. Svi sporovi će se rješavati pred hrvatskim sudovima.'
                },
                contact: {
                    title: 'Kontaktne informacije',
                    description: 'Za pitanja o ovim Uvjetima korištenja, kontaktirajte nas:',
                    email: {
                        label: 'Email',
                        value: 'pravni@solarshop.hr'
                    },
                    phone: {
                        label: 'Telefon',
                        value: '+385 1 234 5678'
                    },
                    address: {
                        label: 'Adresa',
                        value: 'Ilica 1, 10000 Zagreb, Hrvatska'
                    }
                },
                changes: {
                    title: 'Promjene uvjeta',
                    description: 'Zadržavamo pravo mijenjanja ovih uvjeta u bilo koje vrijeme. Promjene će stupiti na snagu odmah nakon objavljivanja.'
                }
            },
            // Cookie Policy
            cookiePolicy: {
                title: 'Pravila o kolačićima',
                subtitle: 'Kako koristimo kolačiće i slične tehnologije',
                lastUpdated: 'Zadnje ažurirano: siječanj 2024.',
                whatAreCookies: {
                    title: 'Što su kolačići',
                    description: 'Kolačići su male tekstualne datoteke koje se postavljaju na vaše računalo ili mobilni uređaj kada posjećujete našu web stranicu. Pomažu nam pružiti vam bolje iskustvo.'
                },
                typesOfCookies: {
                    title: 'Vrste kolačića koje koristimo',
                    essential: {
                        title: 'Osnovni kolačići',
                        description: 'Ovi kolačići su potrebni da web stranica ispravno funkcionira. Omogućavaju osnovne funkcije poput navigacije stranicama i pristupa sigurnim područjima.',
                        authentication: 'Autentifikacija korisnika i status prijave',
                        cart: 'Sadržaj košarice za kupovinu',
                        security: 'Sigurnost i sprječavanje prijevara',
                        preferences: 'Jezične i prikazne preferencije'
                    },
                    performance: {
                        title: 'Kolačići performansi',
                        description: 'Ovi kolačići prikupljaju informacije o tome kako posjetitelji koriste našu web stranicu, pomažući nam poboljšati performanse.',
                        analytics: 'Analitika web stranice i statistike posjetitelja',
                        usage: 'Pregledi stranica i korisničke interakcije',
                        errors: 'Praćenje grešaka i otklanjanje problema'
                    },
                    functional: {
                        title: 'Funkcionalni kolačići',
                        description: 'Ovi kolačići poboljšavaju funkcionalnost naše web stranice pamteći vaše izbore i preferencije.',
                        language: 'Odabir jezika',
                        region: 'Postavke lokacije i regije',
                        accessibility: 'Preferencije pristupačnosti'
                    },
                    marketing: {
                        title: 'Marketing kolačići',
                        description: 'Ovi kolačići se koriste za isporuku relevantnih oglasa i praćenje učinkovitosti marketinških kampanja.',
                        advertising: 'Ciljani oglasi',
                        social: 'Integracija društvenih medija',
                        tracking: 'Praćenje konverzija'
                    }
                },
                thirdParty: {
                    title: 'Kolačići treće strane',
                    description: 'Možemo koristiti usluge treće strane koje postavljaju kolačiće na vaš uređaj:',
                    googleAnalytics: 'Google Analytics za statistike web stranice',
                    socialMedia: 'Dodaci i widgeti društvenih medija',
                    paymentProcessors: 'Usluge obrade plaćanja',
                    supportTools: 'Alati korisničke podrške i chat'
                },
                management: {
                    title: 'Upravljanje kolačićima',
                    browserSettings: {
                        title: 'Postavke preglednika',
                        description: 'Možete kontrolirati kolačiće kroz postavke vašeg preglednika. Većina preglednika vam omogućava blokiranje ili brisanje kolačića.'
                    },
                    consent: {
                        title: 'Pristanak za kolačiće',
                        description: 'Tražit ćemo vaš pristanak prije postavljanja nebitnih kolačića na vaš uređaj.'
                    },
                    optOut: {
                        title: 'Linkovi za odjavu',
                        description: 'Možete se odjaviti od određenih kolačića putem sljedećih linkova: Google Analytics, Facebook, itd.'
                    }
                },
                duration: {
                    title: 'Trajanje kolačića',
                    session: {
                        title: 'Kolačići sesije',
                        description: 'Ovi kolačići se brišu kada zatvorite vaš pregljednik.'
                    },
                    persistent: {
                        title: 'Trajni kolačići',
                        description: 'Ovi kolačići ostaju na vašem uređaju određeno vrijeme ili dok ih ne obrišete.'
                    }
                },
                updates: {
                    title: 'Ažuriranja ovih pravila',
                    description: 'Možemo povremeno ažurirati ova Pravila o kolačićima. Molimo pregledajte ovu stranicu povremeno za promjene.'
                },
                contact: {
                    title: 'Kontaktirajte nas',
                    description: 'Ako imate pitanja o našoj uporabi kolačića, molimo kontaktirajte nas:',
                    email: {
                        label: 'Email',
                        value: 'privatnost@solarshop.hr'
                    },
                    phone: {
                        label: 'Telefon',
                        value: '+385 1 234 5678'
                    },
                    address: {
                        label: 'Adresa',
                        value: 'Ilica 1, 10000 Zagreb, Hrvatska'
                    }
                }
            },
            // Partners Footer
            b2bFooter: {
                partnerResources: 'Partnerski resursi',
                dashboard: 'Početna',
                orderHistory: 'Historija narudžbi',
                training: 'Obuka',
                support: 'Podrška',
                phone: 'Telefon',
                email: 'Email',
                helpCenter: 'Centar pomoći',
                quickAccess: 'Brzi pristup',
                backToB2C: 'Nazad na korisnički portal',
                becomePartner: 'Postani partner',
                readyToPartner: 'Spremni ste da postanete naš partner?',
                joinThousands: 'Pridružite se tisućama partnera širom svijeta i povećajte svoj solarnu efikasnost sa IBC SOLAR-om',
                contactSales: 'Kontaktirajte prodaju'
            }
        },
        en: {
            // Navigation
            nav: {
                products: 'Products',
                offers: 'Deals',
                sustainability: 'Sustainability',
                blog: 'Blog',
                company: 'About us',
                contact: 'Contact & Support',
                partners: 'Partners',
                searchPlaceholder: 'Search products...'
            },
            // B2B Navigation
            b2bNav: {
                home: 'Home',
                products: 'Products',
                offers: 'Offers',
                about: 'About us',
                contact: 'Contact',
                signIn: 'Sign In',
                getStarted: 'Get Started',
                dashboard: 'Dashboard',
                profile: 'Profile',
                orders: 'Orders',
                signOut: 'Sign Out',
                partner: 'Partner'
            },
            // Authentication
            auth: {
                welcome: 'Welcome back',
                welcomeMessage: 'Sign in to your account',
                signIn: 'Sign in',
                noAccount: 'Don\'t have an account?',
                signUp: 'Sign Up',
                email: 'Email address',
                password: 'Password',
                forgotPassword: 'Forgot your password?',
                signInButton: 'Sign In',
                signingIn: 'Signing In...',
                backToHome: 'Back to Home',
                emailRequired: 'Email address is required',
                emailInvalid: 'Please enter a valid email address',
                passwordRequired: 'Password is required',
                passwordMinLength: 'Password must be at least {{min}} characters',
                fieldRequired: '{{field}} is required',
                loginError: 'Invalid login credentials',
                required: '{{field}} is required',
                invalidEmail: 'Please enter a valid email address'
            },
            // Register
            register: {
                title: 'Sign Up for SolarShop',
                subtitle: 'Create your account to get started',
                alreadyHaveAccount: 'Already have an account?',
                signIn: 'Sign In',
                firstName: 'First Name',
                firstNameRequired: 'First name is required',
                lastName: 'Last Name',
                lastNameRequired: 'Last name is required',
                email: 'Email Address',
                emailRequired: 'Email address is required',
                emailInvalid: 'Please enter a valid email address',
                phoneNumber: 'Phone Number',
                phoneNumberInvalid: 'Please enter a valid phone number',
                address: 'Address',
                password: 'Password',
                passwordRequired: 'Password is required',
                passwordMinLength: 'Password must be at least 8 characters',
                confirmPassword: 'Confirm Password',
                confirmPasswordRequired: 'Confirm password is required',
                passwordMismatch: 'Passwords do not match',
                createAccount: 'Create Account',
                creatingAccount: 'Creating account...',
                enterFirstName: 'Enter your first name',
                enterLastName: 'Enter your last name',
                enterEmail: 'Enter your email address',
                enterPhone: 'Enter your phone number',
                enterAddress: 'Enter your full address',
                createPassword: 'Create Password',
                confirmYourPassword: 'Confirm your password'
            },
            // Forgot Password
            forgotPassword: {
                title: 'Forgot Password?',
                subtitle: 'No problem, we\'ll send you instructions to reset your password.',
                rememberPassword: 'Remember your password?',
                signIn: 'Sign In',
                email: 'Email Address',
                enterEmail: 'Enter your email',
                resetPassword: 'Reset Password',
                sendingResetEmail: 'Sending reset email...',
                backToHome: 'Back to Home'
            },
            // Partners Register
            partnersRegister: {
                title: 'Partner Registration',
                subtitle: 'Join our partner network and discover exclusive benefits, special offers and professional support for your business.',
                step1: 'Personal Information',
                step2: 'Company Information',
                personalInfo: 'Personal Information',
                companyInfo: 'Company Information',
                companyName: 'Company Name',
                companyNameRequired: 'Company name is required',
                taxNumber: 'Tax Number',
                taxNumberRequired: 'Tax number is required',
                taxNumberInvalid: 'Please enter a valid tax number',
                companyAddress: 'Company Address',
                companyAddressRequired: 'Company address is required',
                companyPhone: 'Company Phone',
                companyPhoneRequired: 'Company phone is required',
                companyEmail: 'Company Email',
                companyEmailRequired: 'Company email is required',
                website: 'Website',
                businessType: 'Business Type',
                businessTypeRequired: 'Business type is required',
                retailer: 'Retailer',
                wholesaler: 'Wholesaler',
                installer: 'Installer',
                distributor: 'Distributor',
                other: 'Other',
                yearsInBusiness: 'Years in Business',
                yearsInBusinessRequired: 'Years in business are required',
                annualRevenue: 'Annual Revenue (EUR)',
                numberOfEmployees: 'Number of Employees',
                description: 'Company Description',
                descriptionPlaceholder: 'Tell us about your company and industry...',
                previousStep: 'Previous Step',
                nextStep: 'Next Step',
                submitApplication: 'Submit Application',
                submittingApplication: 'Submitting application...',
                applicationSubmitted: 'Your application has been submitted successfully! We\'ll contact you soon.',
                applicationMessage: 'Your application for partnership has been sent for review. We\'ll be in touch soon.',
                enterCompanyName: 'Enter company name',
                enterTaxNumber: 'Enter tax number',
                enterCompanyAddress: 'Enter company address',
                enterCompanyPhone: 'Enter company phone',
                enterCompanyEmail: 'Enter company email',
                enterWebsite: 'Enter website URL (optional)',
                selectBusinessType: 'Select business type',
                enterYearsInBusiness: 'Enter years in business',
                enterAnnualRevenue: 'Enter annual revenue (optional)',
                enterNumberOfEmployees: 'Enter number of employees (optional)'
            },
            // B2B Hero
            b2b: {
                hero: {
                    title: 'Become Our Partner',
                    subtitle: 'Join our partner network and discover exclusive benefits, special offers and professional support for your business.',
                    getStarted: 'Get Started',
                    learnMore: 'Learn More'
                },
                about: {
                    title: 'About Partnership',
                    subtitle: 'Why partner with SolarShop',
                    benefits: 'Benefits of Partnership',
                    exclusivePricing: 'Exclusive Pricing',
                    exclusivePricingText: 'Access special prices and discounts for partners.',
                    dedicatedSupport: 'Dedicated Support',
                    dedicatedSupportText: 'Personal account manager and technical support.',
                    marketingSupport: 'Marketing Support',
                    marketingSupportText: 'Marketing materials and support for promotion.',
                    training: 'Training and Education',
                    trainingText: 'Regular training on products and technologies.',
                    requirements: 'Partnership Requirements',
                    requirementsText: 'Learn what we need from you to become our partner.',
                    businessExperience: 'Business Experience',
                    businessExperienceText: 'Minimum 2 years of experience in the solar industry.',
                    financialStability: 'Financial Stability',
                    financialStabilityText: 'Demonstrated financial stability and creditworthiness.',
                    technicalCapability: 'Technical Capability',
                    technicalCapabilityText: 'Qualified team for installation and maintenance.',
                    commitment: 'Commitment to Quality',
                    commitmentText: 'Commitment to providing high-quality services to our customers.',
                    readyToJoin: 'Ready to Join Our Partner Network?',
                    startApplicationToday: 'Start your application today and unlock exclusive benefits for your business.'
                },
                contact: {
                    title: 'Partner Contact',
                    subtitle: 'Have questions about partnering with us? Contact us.',
                    getInTouch: 'Get in touch',
                    partnerSupportText: 'Partner support is available 24/7 to assist you with any questions or issues you may have.',
                    partnershipInquiry: 'Partnership Inquiry',
                    name: 'Name',
                    email: 'Email',
                    company: 'Company',
                    message: 'Message',
                    sendMessage: 'Send Message',
                    sendingMessage: 'Sending message...',
                    messageSent: 'Message sent!',
                    enterName: 'Enter your name',
                    enterEmail: 'Enter your email',
                    enterCompany: 'Enter company name',
                    enterMessage: 'Enter your message',
                    partnerSupport: 'Partner Support',
                    phone: '+385 1 234 5678',
                    salesTeam: 'Sales Team',
                    salesTeamText: 'Our sales team is available to assist you with any questions or issues you may have.',
                    salesTeamEmail: 'sales@solarshop.hr',
                    salesTeamPhone: '+385 1 234 5679',
                    technicalSupport: 'Technical Support',
                    technicalSupportText: 'Our technical support team is available to assist you with any questions or issues you may have.',
                    technicalSupportEmail: 'tech@solarshop.hr',
                    technicalSupportPhone: '+385 1 234 5680',
                    supportEmail: 'partners@solarshop.hr',
                    officeAddress: 'Ilica 1, 10000 Zagreb, Croatia',
                    address: 'Ilica 1, 10000 Zagreb, Croatia',
                    businessHours: 'Business Hours: Mon-Fri 8:00-17:00',
                    mondayFriday: 'Mon-Fri',
                    saturday: 'Sat',
                    sunday: 'Sun',
                    closed: 'Closed',
                    subject: 'Subject',
                    selectSubject: 'Select subject',
                    selectSubjectRequired: 'Subject is required',
                    pricingInquiry: 'Pricing Inquiry',
                    salesInquiry: 'Sales Inquiry',
                    messagePlaceholder: 'Enter your message...',
                },
                products: {
                    title: 'Partner Products',
                    subtitle: 'Exclusive products and pricing for our partners',
                    productCategories: 'Product Categories',
                    ourBrands: 'Our Brands',
                    premiumInverterSolutions: 'Premium inverter solutions',
                    reliableSolarTechnology: 'Reliable solar technology',
                    smartEnergySolutions: 'Smart energy solutions',
                    partnerPrice: 'Partner Price',
                    retailPrice: 'Retail Price',
                    savings: 'Savings',
                    loginToViewPrices: 'Login to view prices',
                    minimumOrder: 'Minimum order',
                    pieces: 'pieces',
                    contactForPricing: 'Contact for pricing',
                    addToCart: 'Add to Cart',
                    requestQuote: 'Request Quote',
                    viewDetails: 'View Details',
                    signInToOrder: 'Sign in to order',
                    noProducts: 'No products',
                    noProductsText: 'No partner products available at the moment.',
                    availableForPartners: 'Available only to partners'
                },
                offers: {
                    title: 'Offers for Partners',
                    subtitle: 'Exclusive offers and discounts for our partners',
                    currentHighlights: 'Current Highlights',
                    loginRequired: 'Login required to view offers',
                    loginToViewOffers: 'Login to view offers',
                    loginToViewPrices: 'Login to view prices',
                    partnerOnly: 'Only for partners',
                    expires: 'Expires',
                    savings: 'Savings',
                    couponCode: 'Coupon Code',
                    copy: 'Copy',
                    claimOffer: 'Claim Offer',
                    expired: 'Expired',
                    signInToClaim: 'Sign in to claim',
                    viewDetails: 'View Details',
                    noOffers: 'No offers',
                    noOffersText: 'No partner offers available at the moment.',
                    bulkDiscount: 'Bulk Discount',
                    limitedTime: 'Limited Time',
                    contactForDetails: 'Contact us for details'
                }
            },
            // Admin Company Management
            adminCompany: {
                title: 'Company Management',
                subtitle: 'Review and manage partner applications',
                pendingApproval: 'Pending Approval',
                approved: 'Approved',
                rejected: 'Rejected',
                companyName: 'Company Name',
                contactPerson: 'Contact Person',
                businessType: 'Business Type',
                status: 'Status',
                actions: 'Actions',
                view: 'View',
                approve: 'Approve',
                reject: 'Reject',
                edit: 'Edit',
                delete: 'Delete',
                companyDetails: 'Company Details',
                personalInfo: 'Personal Information',
                companyInfo: 'Company Information',
                approveCompany: 'Approve Company',
                rejectCompany: 'Reject Company',
                confirmApprove: 'Are you sure you want to approve this company?',
                confirmReject: 'Are you sure you want to reject this company?',
                confirmDelete: 'Are you sure you want to delete this company?',
                companyApproved: 'Company Approved',
                companyRejected: 'Company Rejected',
                companyDeleted: 'Company Deleted',
                noCompanies: 'No companies',
                noCompaniesText: 'No partner applications at the moment.'
            },
            // Admin Panel
            admin: {
                dashboard: 'Dashboard',
                products: 'Products',
                categories: 'Categories',
                blog: 'Blog Posts',
                offers: 'Offers',
                users: 'Users',
                orders: 'Orders',
                reviews: 'Reviews',
                companyPricing: 'Company Pricing',
                companies: 'Companies',
                wishlist: 'Wishlist',
                manageOffers: 'Manage Offers',
                manageProducts: 'Manage Products',
                manageUsers: 'Manage Users',
                manageOrders: 'Manage Orders',
                contentManagement: 'Content Management',
                systemManagement: 'System Management',
                language: 'Language',
                // Order management
                orderNumber: 'Order Number',
                orderDetailsAndLineItems: 'Order Details & Line Items',
                editOrder: 'Edit Order',
                totalAmount: 'Total Amount',
                items: 'Items',
                orderDate: 'Order Date',
                paymentMethod: 'Payment Method',
                creditCard: 'Credit Card',
                customerInformation: 'Customer Information',
                billingAddress: 'Billing Address',
                shippingAddress: 'Shipping Address',
                orderItems: 'Order Items',
                addItem: 'Add Item',
                productName: 'Product Name',
                unitPrice: 'Unit Price',
                quantity: 'Quantity',
                discountPercent: 'Discount %',
                subtotal: 'Subtotal',
                noItemsInOrder: 'No items in order',
                addItemsToOrder: 'Add items to order',
                addFirstItem: 'Add First Item',
                orderDiscount: 'Order Discount',
                orderDiscountPercent: 'Order Discount %',
                orderSummary: 'Order Summary',
                itemDiscounts: 'Item Discounts',
                shipping: 'Shipping',
                tax: 'Tax',
                total: 'Total',
                printInvoice: 'Print Invoice',
                saveChanges: 'Save Changes',
                orderNotFound: 'Order Not Found',
                goBack: 'Go Back',
                // Offer management
                offerDetailsAndProducts: 'Offer Details & Products',
                editOffer: 'Edit Offer',
                active: 'Active',
                inactive: 'Inactive',
                type: 'Type',
                discountType: 'Discount Type',
                discountValue: 'Discount Value',
                minPurchase: 'Min. Purchase',
                offerTimeline: 'Offer Timeline',
                startDate: 'Start Date',
                endDate: 'End Date',
                usageLimit: 'Usage Limit',
                unlimited: 'Unlimited',
                productsInOffer: 'Products in Offer',
                addProduct: 'Add Product',
                category: 'Category',
                originalPrice: 'Original Price',
                finalPrice: 'Final Price',
                noProductsAssigned: 'No products assigned',
                addProductsToOffer: 'Add products to offer',
                addFirstProduct: 'Add First Product',
                offerSummary: 'Offer Summary',
                totalOriginal: 'Total Original',
                totalDiscounted: 'Total Discounted',
                totalSavings: 'Total Savings',
                termsConditions: 'Terms & Conditions',
                offerNotFound: 'Offer Not Found'
            },
            // Admin Users
            adminUsers: {
                createUser: 'Create User',
                editUser: 'Edit User',
                manageUserAccounts: 'Manage user accounts and profiles',
                personalInformation: 'Personal Information',
                profileInformation: 'Profile Information',
                addressInformation: 'Address Information',
                firstName: 'First Name',
                lastName: 'Last Name',
                email: 'Email',
                phone: 'Phone',
                avatarUrl: 'Avatar URL',
                role: 'Role',
                dateOfBirth: 'Date of Birth',
                bio: 'Bio',
                streetAddress: 'Street Address',
                city: 'City',
                state: 'State',
                postalCode: 'Postal Code',
                country: 'Country',
                firstNameRequired: 'First name is required',
                lastNameRequired: 'Last name is required',
                emailRequired: 'Email is required',
                validEmailRequired: 'Please enter a valid email',
                roleRequired: 'Role is required',
                selectRole: 'Select role',
                roleUser: 'User',
                roleAdmin: 'Admin',
                roleModerator: 'Moderator'
            },
            // Admin Company Pricing
            adminCompanyPricing: {
                createPricing: 'Create Pricing',
                editPricing: 'Edit Pricing',
                setPriceForCompany: 'Set custom product price for company',
                pricingDetails: 'Pricing Details',
                companyId: 'Company ID',
                productId: 'Product ID',
                price: 'Price',
                companyIdRequired: 'Company ID is required',
                productIdRequired: 'Product ID is required',
                priceRequired: 'Price is required',
                priceMinimum: 'Price must be positive',
                priceDescription: 'Enter custom price in euros for this product and company',
                additionalInfo: 'Additional Information',
                importantNotes: 'Important Notes',
                note1: 'Custom prices take precedence over standard prices',
                note2: 'Changes apply immediately to all future orders',
                note3: 'Contact the company before changing existing prices'
            },
            // Reviews
            reviewsSection: {
                customerReviews: 'Customer Reviews',
                basedOnReviews: 'Based on {{count}} reviews',
                ratingBreakdown: 'Rating Breakdown',
                writeReview: 'Write Review',
                verifiedPurchase: 'Verified Purchase',
                helpful: 'Helpful',
                report: 'Report',
                loadMoreReviews: 'Load More Reviews',
                noReviewsYet: 'No reviews yet',
                beFirstToReview: 'Be the first to review this product',
                writeFirstReview: 'Write First Review'
            },
            // Profile
            profile: {
                profile: 'Profile',
                adminDashboard: 'Admin Dashboard',
                signOut: 'Sign Out',
                myProfile: 'My Profile',
                manageAccount: 'Manage your account settings and preferences',
                profileUpdated: 'Profile updated successfully!',
                updateError: 'An error occurred while updating your profile.',
                userInfo: 'User Info',
                billingShipping: 'Billing & Shipping Details',
                personalInformation: 'Personal Information',
                updatePersonalDetails: 'Update your personal details and contact information',
                changePhoto: 'Change Photo',
                photoRequirements: 'JPG, GIF or PNG. 1MB max.',
                firstName: 'First Name',
                lastName: 'Last Name',
                emailAddress: 'Email Address',
                phoneNumber: 'Phone Number',
                dateOfBirth: 'Date of Birth',
                gender: 'Gender',
                selectGender: 'Select gender',
                male: 'Male',
                female: 'Female',
                other: 'Other',
                preferNotToSay: 'Prefer not to say',
                saveChanges: 'Save Changes',
                saving: 'Saving...',
                firstNameRequired: 'First name is required',
                lastNameRequired: 'Last name is required',
                validEmailRequired: 'Please enter a valid email address',
                enterFirstName: 'Enter your first name',
                enterLastName: 'Enter your last name',
                enterEmailAddress: 'Enter your email address',
                enterPhoneNumber: 'Enter your phone number',
                addresses: 'Addresses',
                manageBillingShipping: 'Manage Billing & Shipping',
                addAddress: 'Add Address',
                default: 'Default',
                edit: 'Edit',
                delete: 'Delete',
                noAddressesFound: 'No addresses found',
                addFirstAddress: 'Add your first address for starting',
                paymentMethods: 'Payment Methods',
                manageSavedPayment: 'Manage Saved Payment',
                addPaymentMethod: 'Add Payment Method',
                noPaymentMethodsFound: 'No payment methods found',
                addFirstPayment: 'Add your first payment method for starting',
                myOrders: 'My Orders',
                viewOrderHistory: 'View your order history and track shipments',
                viewDetails: 'View Details',
                writeReview: 'Write Review',
                trackOrder: 'Track Order',
                noOrdersFound: 'No orders found',
                startShopping: 'Start shopping to see your orders here',
                browseProducts: 'Browse Products',
                myWishlist: 'My Wishlist',
                viewWishlistItems: 'View Wishlist Items',
                noWishlistItems: 'No products in wishlist',
                startAddingToWishlist: 'Start adding products to your wishlist',
                addToCart: 'Add to Cart',
                addToWishlist: 'Add to Wishlist',
                removeFromWishlist: 'Remove from Wishlist',
                addedToWishlist: 'Added to Wishlist!',
                removedFromWishlist: 'Removed from Wishlist!',
                alreadyInWishlist: 'Product is already in Wishlist',
                addToWishlistError: 'Error adding to Wishlist',
                removeFromWishlistError: 'Error removing from Wishlist',
                freeShipping: 'Free shipping',
                myReviews: 'My Reviews',
                manageReviews: 'Manage your reviews and view admin responses',
                verifiedPurchase: 'Verified Purchase',
                adminResponse: 'Admin Response',
                editReview: 'Edit Review',
                deleteReview: 'Delete Review',
                noReviewsFound: 'No reviews found',
                writeFirstReview: 'Write your first review after purchasing a product'
            },
            // Common
            common: {
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                view: 'View',
                close: 'Close',
                search: 'Search',
                filter: 'Filter',
                sort: 'Sort',
                next: 'Next',
                previous: 'Previous',
                page: 'Page',
                of: 'of',
                noResults: 'No results',
                tryAgain: 'Try again',
                clear: 'Clear'
            },
            // Contact Information
            contact: {
                phone: '+385 1 234 5678',
                email: 'info@solarshop.hr'
            },
            // Language
            language: {
                current: 'English'
            },
            // Hero Section
            hero: {
                mainTitle: 'Your Destination for Solar Energy',
                subtitle: 'Shop high-quality solar panels, inverters, batteries and equipment. Everything you need for your own solar energy system in one place.',
                exploreProducts: 'Explore Products',
                exploreOffers: 'Explore Offers',
                loading: 'Loading...',
                noOffersAvailable: 'No offers available at the moment',
                primeDeal: 'Prime Deal'
            },
            // Products
            products: {
                title: 'Products',
                subtitle: 'Discover our wide range of products for sustainable and energy-efficient construction',
                exploreProducts: 'Explore Products',
                productsCount: '{{count}} Products',
                needHelp: 'Need Help Choosing?',
                needHelpText: 'Our experts are here to help you find the perfect products for your project. Get personalized recommendations today.',
                contactExperts: 'Contact Our Experts',
                noCategories: 'No product categories available',
                noCategoriesText: 'Check back later for our product categories.'
            },
            // Offers
            offers: {
                title: 'Special Offers',
                subtitle: 'Discover incredible savings on solar systems and components',
                allCategories: 'All Categories',
                solarPanels: 'Solar Panels',
                inverters: 'Inverters',
                batteries: 'Batteries',
                accessories: 'Accessories',
                offersAvailable: '{{count}} offers available',
                sale: 'SALE',
                youSave: 'You save {{amount}}',
                addToCart: 'Add to Cart',
                viewDetails: 'View Details',
                noOffers: 'No offers available',
                noOffersText: 'There are currently no active offers. Check our product range.',
                browseAllProducts: 'Browse All Products',
                dontMissOut: 'Don\'t miss out!',
                subscribeText: 'Subscribe to our newsletter and be the first to know about new offers.',
                enterEmail: 'Enter your email',
                subscribe: 'Subscribe',
                viewAll: 'View All'
            },
            // Mission/Sustainability
            mission: {
                title: 'Sustainability',
                subtitle: 'At SolarShop, we believe that building and renovating doesn\'t just mean creating comfortable and functional spaces, but also taking care of the environment we live in.',
                ourPhilosophy: 'Our Philosophy',
                environmentalResponsibility: 'Environmental Responsibility',
                environmentalText: 'Every product we offer is carefully evaluated for its environmental impact, from production phase to final disposal.',
                qualityDurability: 'Quality and Durability',
                qualityText: 'Durable and resistant materials reduce waste and frequent maintenance, offering more sustainable and cost-effective solutions over time.',
                technologicalInnovation: 'Technological Innovation',
                innovationText: 'We collaborate with suppliers and brands that invest in research and development, focusing on cutting-edge technologies and low environmental impact materials.',
                commitmentBeyond: 'Our Commitment Beyond the Product',
                personalizedConsulting: 'Personalized Consulting',
                consultingText: 'We help our customers identify tailor-made solutions to make buildings more efficient and low-impact, providing concrete suggestions and guidance.',
                continuousUpdates: 'Continuous Updates and Research',
                updatesText: 'We constantly monitor industry innovations and new regulations, to always offer the best technologies and most virtuous practices.',
                awarenessEducation: 'Awareness and Education',
                educationText: 'Through our blog, guides and support service, we offer useful information to understand the benefits of sustainability and the advantages of investing in certified products.',
                materialSelection: 'How We Select Materials',
                rawMaterialsAnalysis: 'Raw Materials Analysis',
                rawMaterialsText: 'We prioritize renewable, recycled or recyclable materials, avoiding substances harmful to health and the ecosystem.',
                certificationEvaluation: 'Certification Evaluation',
                certificationText: 'Before proposing a product, we verify its environmental and quality certifications, such as LEED, CasaClima, FSC, PEFC or ISO 14001.',
                energyEfficiency: 'Energy Efficiency',
                efficiencyText: 'We choose products and solutions that improve thermal insulation, reduce consumption and favor the use of renewable energy sources.',
                subscribeNewsletter: 'Subscribe to Our Newsletter',
                subscribe: 'Subscribe',
                callToAction: 'Together, we can build a future where comfort, quality, efficiency and respect for the environment go hand in hand. By choosing SolarShop, you choose to contribute to a healthier, more balanced and conscious world.'
            },
            // Sustainability Section
            sustainability: {
                energyEfficiencySuggestions: 'Energy Efficiency Suggestions',
                energyEfficiencySuggestionsText: 'Guides for thermal insulation, consumption reduction, and renewable energy systems.',
                greenCertifications: 'Green Certifications & Standards',
                greenCertificationsText: 'Overview of certifications (LEED, ISO 14001, etc.)',
                reducedEnvironmentalImpact: 'Reduced Environmental Impact Products',
                reducedEnvironmentalImpactText: 'Selection of solutions focused on sustainability and recyclability.',
                sustainableMaterials: 'Sustainable Materials',
                sustainableMaterialsText: 'Certified low-impact products.',
                towardsSustainability: 'Towards Sustainability'
            },
            // Blog
            blog: {
                title: 'Blog & Articles',
                subtitle: 'Latest news, tips and insights from the world of solar energy',
                allPosts: 'All Posts',
                loading: 'Loading...',
                unableToLoad: 'Unable to Load Articles',
                tryAgain: 'Try Again',
                featured: 'Featured',
                loadMore: 'Load More',
                noPosts: 'No articles',
                noPostsText: 'Currently no articles available. Check back later.',
                readMore: 'Read more',
                viewAllPosts: 'View all articles',
                recentProjects: 'Latest projects and insights',
                recentProjectsSubtitle: 'Discover the latest solar projects, technical insights and expert advice from our team',
                relatedArticles: 'Related Articles',
                stayUpdated: 'Stay Updated',
                newsletterText: 'Subscribe to our newsletter and be the first to know about new articles and solar solutions.',
                articleNotFound: 'Article not found',
                backToBlog: 'Back to Blog',
                whatYouFind: 'What you\'ll find',
                technicalGuides: 'Technical Guides',
                technicalGuidesText: 'Detailed guides for installation, maintenance and optimization of solar systems.',
                regulationsInsights: 'Regulations Insights',
                regulationsText: 'Latest information on solar incentives, laws and regulations.',
                sustainabilityTips: 'Sustainability Tips',
                sustainabilityText: 'Practical tips for green living and maximizing energy efficiency.',
                caseStudies: 'Case Studies',
                caseStudiesText: 'Real examples of successful solar installations and their results.',
                faqTutorials: 'FAQ and Tutorials',
                faqText: 'Answers to frequently asked questions and step-by-step tutorials.',
                trustedPartner: 'Your trusted partner',
                partnerText: 'Over 10 years of experience in the solar industry. Our team of experts shares knowledge through informative articles that help you make the right decisions.'
            },
            // Company
            company: {
                title: 'Our Company',
                subtitle: 'Welcome to the section dedicated to our company. Here you can learn more about us, our history, our values and the team.',
                whoWeAre: 'Who We Are',
                whoWeAreText: 'SolarShop was born from the experience of professionals in the construction sector who, by combining their skills, decided to create a portal.',
                mission: 'Our mission is simple: to make accessible to everyone the most innovative solutions for sustainable construction.',
                ourTeam: 'Our Team',
                teamText: 'Behind SolarShop is a group of passionate and competent people: engineers, architects, energy consultants and construction professionals.',
                missionValues: 'Mission and Values',
                quality: 'Quality',
                qualityText: 'We offer only tested and certified products, selected from the most reliable brands on the market.',
                innovation: 'Innovation',
                innovationText: 'We focus on the most advanced technologies and on last generation materials.',
                sustainability: 'Sustainability',
                sustainabilityText: 'We respect the planet, choosing low-impact materials, encouraging the use of renewable energies.',
                support: 'Support',
                supportText: 'We accompany you in every phase, from product selection to post-sale assistance.',
                suppliersPartners: 'Suppliers and Partners',
                partnersText: 'We collaborate with the most established brands and specialized companies.',
                socialResponsibility: 'Social Responsibility and Environmental',
                responsibilityText: 'Our commitment does not stop at the product. We commit to promoting the culture of sustainability.'
            },
            // Cart
            cart: {
                title: 'Your cart',
                empty: 'Your cart is empty!',
                emptyText: 'Add some products to start shopping.',
                continueShopping: 'Continue shopping',
                remove: 'Remove',
                discountCode: 'Discount code',
                enterDiscountCode: 'Enter discount code',
                apply: 'Apply',
                subtotal: 'Subtotal',
                tax: 'Tax',
                shipping: 'Shipping',
                discount: 'Discount',
                total: 'Total',
                proceedToCheckout: 'Proceed to Checkout',
                itemAddedToCart: 'Item added to cart!',
                adding: 'Adding...',
                openCart: 'Open cart',
                freeShipping: 'Free shipping',
                freeShippingProgress: 'Add {{amount}} more for free shipping!',
                freeShippingRemaining: 'Add {{amount}} for free shipping!',
                yourCart: 'Your cart',
                checkout: 'Checkout'
            },
            // Checkout
            checkout: {
                title: 'Checkout',
                completeOrder: 'Complete your order',
                step1: 'Order Review',
                step2: 'Shipping Information',
                step3: 'Payment Method',
                orderSummary: 'Order Summary',
                subtotal: 'Subtotal',
                tax: 'Tax',
                total: 'Total',
                personalInfo: 'Personal Information',
                firstName: 'First Name',
                firstNameRequired: 'First name is required',
                lastName: 'Last Name',
                email: 'Email',
                phone: 'Phone',
                shippingAddress: 'Shipping Address',
                address: 'Address',
                city: 'City',
                postalCode: 'Postal Code',
                country: 'Country',
                paymentMethod: 'Payment Method',
                creditCard: 'Credit Card',
                paypal: 'PayPal',
                payOnDelivery: 'Pay on Delivery',
                bankTransfer: 'Bank Transfer',
                cardNumber: 'Card Number',
                expiryDate: 'Expiry Date',
                cvv: 'CVV',
                placeOrder: 'Place Order',
                processing: 'Processing...',
                orderPlaced: 'Order placed successfully!',
                orderNumber: 'Order number: {{number}}',
                orderCompletedSuccessfully: 'Order Completed Successfully!',
                orderCreated: 'Order #{{number}} has been created and is pending review.',
                backStep: 'Back to',
                nextStep: 'Continue to'
            },
            // Footer
            footer: {
                companyDescription: 'Your destination for sustainable building materials and energy efficiency solutions. Let\'s build a greener future together.',
                address: 'Ilica 1, 10000 Zagreb, Croatia',
                phone: '+385 1 234 5678',
                email: 'info@solarshop.hr',
                hours: 'Mon-Fri: 8:00-17:00',
                followUs: 'Follow us:',
                newsletter: 'Newsletter',
                newsletterDescription: 'Stay updated with our latest products and offers.',
                subscribe: 'Subscribe',
                yourEmail: 'Your email',
                copyright: 'Copyright',
                allRightsReserved: 'All rights reserved.',
                privacyPolicy: 'Privacy Policy',
                termsOfService: 'Terms of Service',
                cookiePolicy: 'Cookie Policy',
                isoCertified: 'ISO 14001 Certified',
                sustainable: '100% Sustainable'
            },
            // Product Reviews
            reviews: {
                customerReviews: 'Customer Reviews',
                basedOnReviews: 'Based on {{count}} reviews',
                writeReview: 'Write a Review',
                verifiedPurchase: 'Verified Purchase',
                helpful: 'Helpful ({{count}})',
                report: 'Report',
                loadMoreReviews: 'Load More Reviews',
                excellentQuality: 'Excellent quality and performance',
                goodValue: 'Good value for money',
                highlyRecommended: 'Highly recommended!',
                solidProduct: 'Solid product',
                outstandingService: 'Outstanding customer service'
            },
            // Search
            search: {
                searchProducts: 'Search products',
                search: 'Search',
                placeholder: 'Enter product name or description...',
                searchByName: 'Search by name or description...',
                suggestions: 'Suggestions',
                clear: 'Clear',
                solarPanels: 'Solar Panels',
                inverters: 'Inverters',
                batteries: 'Batteries',
                mountingSystems: 'Mounting Systems',
                cables: 'Cables'
            },
            // Contact & Support
            contactSupport: {
                title: 'Contacts & Assistance',
                subtitle: 'Need help or want more information? We\'re here for you. The Contacts & Assistance section of SolarShop is designed to provide you with all the support you need, from product selection to post-sale, ensuring a simple, transparent and secure shopping experience.',
                contactForm: 'Contact Form',
                contactFormText: 'Fill in the online form found on this page, entering your data and the nature of your request. A member of our staff will contact you shortly.',
                name: 'Name',
                lastName: 'Last Name',
                email: 'Email',
                message: 'Message',
                typeMessage: 'Type your message here...',
                sendMessage: 'Send message',
                sending: 'Sending...',
                postSaleAssistance: 'POST-SALE ASSISTANCE',
                postSaleAssistanceText: 'Once you\'ve completed your purchase, we don\'t leave you alone. Have questions about the products you received, delivery times, or installation methods? Our post-sale assistance service is at your disposal to:',
                detailedProductInfo: 'Provide detailed information about the products you chose.',
                installationGuidance: 'Guide you in installation or use of materials.',
                issueResolution: 'Help you with any issues, ensuring quick and effective solutions.',
                technicalSupport: 'Technical Support & Showroom',
                technicalSupportText: 'If you want a more direct contact, or if your project requires specific technical support, you may visit one of our showrooms or assistance centers, where you can talk to our experts and see the products up close.',
                returnsShipping: 'Returns & Shipping Policy',
                returnsShippingText: 'Consult our section dedicated to Returns and Shipping Policy to learn about the return procedures, delivery times and conditions for any refunds. We are always transparent, so you can shop with confidence knowing that you can count on us in case of changes or issues.',
                learnMore: 'Learn more',
                faq: 'FAQ',
                faqQuestion1: 'What types of services does SolarShop offer?',
                faqAnswer1: 'SolarShop offers a wide range of services, including energy audits, energy modeling, high-efficiency system installations, renewable energy integration, building envelope upgrades, mechanical system upgrades, electrical system upgrades, plumbing system upgrades, and comprehensive project management.',
                faqQuestion2: 'Who are your services designed for?',
                faqAnswer2: 'Our services are designed for homeowners, businesses, and contractors looking to improve energy efficiency, reduce costs, and implement sustainable building solutions.',
                faqQuestion3: 'How can photovoltaic systems benefit me?',
                faqAnswer3: 'Photovoltaic systems can significantly reduce your electricity bills, increase your property value, provide energy independence, and contribute to environmental sustainability by reducing your carbon footprint.',
                faqQuestion4: 'What is a thermal jacket, and why is it important?',
                faqAnswer4: 'A thermal jacket refers to building insulation that wraps around your home like a jacket, preventing heat loss in winter and heat gain in summer. This improves energy efficiency and comfort while reducing heating and cooling costs.',
                faqQuestion5: 'Are your energy solutions environmentally friendly?',
                faqAnswer5: 'Yes, all our energy solutions are designed with sustainability in mind. We focus on renewable energy sources, energy-efficient technologies, and environmentally responsible materials and practices.',
                faqQuestion6: 'Can you manage complete renovations?',
                faqAnswer6: 'Absolutely! We provide comprehensive project management for complete renovations, handling everything from initial planning and permits to final installation and quality assurance.',
                bottomCta: 'Whatever your need, the SolarShop team is ready to help you. Contact us today and let us guide you towards the solution most suited to your needs. Building or renovating has never been easier, secure and satisfying.'
            },
            // Product List
            productList: {
                title: 'Products',
                subtitle: 'Discover our sustainable building solutions',
                filters: 'Filters',
                categories: 'Categories',
                priceRange: 'Price Range',
                min: 'Min',
                max: 'Max',
                certificates: 'Certificates',
                manufacturer: 'Manufacturer',
                clearAllFilters: 'Clear All Filters',
                productsFound: '{{count}} products found',
                sortBy: 'Sort by:',
                featured: 'Featured',
                newestArrivals: 'Newest Arrivals',
                nameAZ: 'Name A - Z',
                nameZA: 'Name Z - A',
                priceLowHigh: 'Price Low to High',
                priceHighLow: 'Price High to Low',
                available: 'Available',
                limited: 'Limited',
                outOfStock: 'Out of Stock',
                addToCart: 'Add to Cart',
                reviews: 'reviews',
                noProductsFound: 'No products found',
                adjustFilters: 'Try adjusting your filters to see more results.'
            },
            // Product Details
            productDetails: {
                home: 'Home',
                products: 'Products',
                productDetails: 'Product Details',
                productNotFound: 'Product not found',
                backToProducts: 'Back to Products',
                relatedProducts: 'Related Products',
                relatedProductsComingSoon: 'Related products coming soon...',
                // Product Info
                availability: 'Availability',
                inStock: 'In Stock',
                limitedStock: 'Limited Stock',
                outOfStock: 'Out of Stock',
                priceIncludesVat: 'Price includes VAT. Free shipping on orders over €500.',
                description: 'Description',
                specifications: 'Product Specifications',
                category: 'Category',
                manufacturer: 'Manufacturer',
                sku: 'SKU',
                certifications: 'Certifications',
                quantity: 'Quantity',
                addToCart: 'Add to Cart',
                addToWishlist: 'Add to Wishlist',
                removeFromWishlist: 'Remove from Wishlist',
                addedToWishlist: 'Added to Wishlist!',
                removedFromWishlist: 'Removed from Wishlist!',
                alreadyInWishlist: 'Product is already in Wishlist',
                addToWishlistError: 'Error adding to Wishlist',
                removeFromWishlistError: 'Error removing from Wishlist',
                freeShipping: 'Free shipping',
                twoYearWarranty: '2-year warranty',
                easyReturns: 'Easy returns',
                // Product Photos
                zoomImage: 'Zoom Image'
            },
            // Privacy Policy
            privacyPolicy: {
                title: 'Privacy Policy',
                subtitle: 'How we collect, use, and protect your personal information',
                lastUpdated: 'Last updated: January 2024',
                informationWeCollect: {
                    title: 'Information We Collect',
                    intro: 'We collect information you provide directly to us, as well as information we gather automatically when you use our services.',
                    personalInfo: {
                        title: 'Personal Information',
                        name: 'Name and contact information',
                        email: 'Email address',
                        phone: 'Phone number',
                        address: 'Billing and shipping addresses',
                        payment: 'Payment information'
                    },
                    automaticInfo: {
                        title: 'Automatically Collected Information',
                        ip: 'IP address and device information',
                        browser: 'Browser type and version',
                        device: 'Device type and operating system',
                        usage: 'Usage patterns and preferences',
                        cookies: 'Cookies and similar technologies'
                    }
                },
                howWeUse: {
                    title: 'How We Use Your Information',
                    processOrders: 'Process and fulfill your orders',
                    customerService: 'Provide customer service and support',
                    communication: 'Send you important updates and communications',
                    marketing: 'Send marketing communications (with consent)',
                    analytics: 'Improve our services through analytics',
                    legal: 'Comply with legal obligations'
                },
                sharing: {
                    title: 'Information Sharing',
                    intro: 'We do not sell, trade, or rent your personal information. We may share your information only in these circumstances:',
                    serviceProviders: 'With trusted service providers who assist us in operating our business',
                    legal: 'When required by law or to protect our rights',
                    business: 'In connection with a business transaction',
                    consent: 'With your explicit consent'
                },
                security: {
                    title: 'Data Security',
                    description: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
                },
                rights: {
                    title: 'Your Rights',
                    access: 'Access your personal information',
                    correct: 'Correct inaccurate information',
                    delete: 'Request deletion of your information',
                    restrict: 'Restrict processing of your information',
                    portability: 'Data portability',
                    object: 'Object to processing for direct marketing'
                },
                contact: {
                    title: 'Contact Us',
                    description: 'If you have questions about this Privacy Policy, please contact us:',
                    email: {
                        label: 'Email',
                        value: 'privacy@solarshop.hr'
                    },
                    phone: {
                        label: 'Phone',
                        value: '+385 1 234 5678'
                    },
                    address: {
                        label: 'Address',
                        value: 'Ilica 1, 10000 Zagreb, Croatia'
                    }
                },
                changes: {
                    title: 'Changes to This Policy',
                    description: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.'
                }
            },
            // Terms of Service
            termsOfService: {
                title: 'Terms of Service',
                subtitle: 'Terms and conditions for using our services',
                lastUpdated: 'Last updated: January 2024',
                acceptance: {
                    title: 'Acceptance of Terms',
                    description: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.'
                },
                services: {
                    title: 'Description of Services',
                    description: 'SolarShop provides solar energy products and related services including:',
                    products: 'Solar panels, inverters, batteries, and accessories',
                    consultation: 'Energy consultation and system design',
                    installation: 'Professional installation services',
                    support: 'Technical support and maintenance',
                    maintenance: 'Ongoing system monitoring and maintenance'
                },
                accounts: {
                    title: 'User Accounts',
                    description: 'When you create an account with us, you must provide accurate and complete information. You are responsible for:',
                    accurate: 'Providing accurate and up-to-date information',
                    secure: 'Maintaining the security of your account',
                    responsible: 'All activities that occur under your account',
                    notify: 'Notifying us immediately of any unauthorized use'
                },
                orders: {
                    title: 'Orders and Payment',
                    description: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order.',
                    pricing: {
                        title: 'Pricing',
                        description: 'All prices are listed in EUR and include applicable taxes unless otherwise stated.'
                    },
                    payment: {
                        title: 'Payment',
                        description: 'Payment must be received before products are shipped. We accept major credit cards and bank transfers.'
                    }
                },
                shipping: {
                    title: 'Shipping and Delivery',
                    processing: 'Orders are processed within 1-3 business days',
                    delivery: 'Delivery times vary based on location and product availability',
                    risk: 'Risk of loss passes to you upon delivery',
                    damages: 'Inspect packages upon delivery and report damages immediately'
                },
                returns: {
                    title: 'Returns and Refunds',
                    description: 'We want you to be satisfied with your purchase. Our return policy includes:',
                    timeLimit: '30-day return window for most products',
                    condition: 'Items must be in original condition and packaging',
                    authorization: 'Return authorization required before sending items back',
                    refund: 'Refunds processed within 5-10 business days'
                },
                warranties: {
                    title: 'Warranties',
                    description: 'Products come with manufacturer warranties. We provide additional warranty support as an authorized dealer.'
                },
                liability: {
                    title: 'Limitation of Liability',
                    description: 'Our liability is limited to the maximum extent permitted by law. We are not liable for indirect, incidental, or consequential damages.'
                },
                intellectual: {
                    title: 'Intellectual Property',
                    description: 'All content on this website is protected by copyright and other intellectual property rights. You may not reproduce or distribute content without permission.'
                },
                law: {
                    title: 'Governing Law',
                    description: 'These terms are governed by Croatian law. Any disputes will be resolved in Croatian courts.'
                },
                contact: {
                    title: 'Contact Information',
                    description: 'For questions about these Terms of Service, contact us:',
                    email: {
                        label: 'Email',
                        value: 'legal@solarshop.hr'
                    },
                    phone: {
                        label: 'Phone',
                        value: '+385 1 234 5678'
                    },
                    address: {
                        label: 'Address',
                        value: 'Ilica 1, 10000 Zagreb, Croatia'
                    }
                },
                changes: {
                    title: 'Changes to Terms',
                    description: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.'
                }
            },
            // Cookie Policy
            cookiePolicy: {
                title: 'Cookie Policy',
                subtitle: 'How we use cookies and similar technologies',
                lastUpdated: 'Last updated: January 2024',
                whatAreCookies: {
                    title: 'What Are Cookies',
                    description: 'Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience.'
                },
                typesOfCookies: {
                    title: 'Types of Cookies We Use',
                    essential: {
                        title: 'Essential Cookies',
                        description: 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.',
                        authentication: 'User authentication and login status',
                        cart: 'Shopping cart contents',
                        security: 'Security and fraud prevention',
                        preferences: 'Language and display preferences'
                    },
                    performance: {
                        title: 'Performance Cookies',
                        description: 'These cookies collect information about how visitors use our website, helping us improve performance.',
                        analytics: 'Website analytics and visitor statistics',
                        usage: 'Page views and user interactions',
                        errors: 'Error tracking and debugging'
                    },
                    functional: {
                        title: 'Functional Cookies',
                        description: 'These cookies enhance the functionality of our website by remembering your choices and preferences.',
                        language: 'Language selection',
                        region: 'Location and region settings',
                        accessibility: 'Accessibility preferences'
                    },
                    marketing: {
                        title: 'Marketing Cookies',
                        description: 'These cookies are used to deliver relevant advertisements and track the effectiveness of marketing campaigns.',
                        advertising: 'Targeted advertising',
                        social: 'Social media integration',
                        tracking: 'Conversion tracking'
                    }
                },
                thirdParty: {
                    title: 'Third-Party Cookies',
                    description: 'We may use third-party services that place cookies on your device:',
                    googleAnalytics: 'Google Analytics for website statistics',
                    socialMedia: 'Social media plugins and widgets',
                    paymentProcessors: 'Payment processing services',
                    supportTools: 'Customer support and chat tools'
                },
                management: {
                    title: 'Managing Cookies',
                    browserSettings: {
                        title: 'Browser Settings',
                        description: 'You can control cookies through your browser settings. Most browsers allow you to block or delete cookies.'
                    },
                    consent: {
                        title: 'Cookie Consent',
                        description: 'We will ask for your consent before placing non-essential cookies on your device.'
                    },
                    optOut: {
                        title: 'Opt-Out Links',
                        description: 'You can opt out of certain cookies through the following links: Google Analytics, Facebook, etc.'
                    }
                },
                duration: {
                    title: 'Cookie Duration',
                    session: {
                        title: 'Session Cookies',
                        description: 'These cookies are deleted when you close your browser.'
                    },
                    persistent: {
                        title: 'Persistent Cookies',
                        description: 'These cookies remain on your device for a set period or until you delete them.'
                    }
                },
                updates: {
                    title: 'Updates to This Policy',
                    description: 'We may update this Cookie Policy from time to time. Please review this page periodically for changes.'
                },
                contact: {
                    title: 'Contact Us',
                    description: 'If you have questions about our use of cookies, please contact us:',
                    email: {
                        label: 'Email',
                        value: 'privacy@solarshop.hr'
                    },
                    phone: {
                        label: 'Phone',
                        value: '+385 1 234 5678'
                    },
                    address: {
                        label: 'Address',
                        value: 'Ilica 1, 10000 Zagreb, Croatia'
                    }
                }
            },
            // Partners Footer
            b2bFooter: {
                partnerResources: 'Partner Resources',
                dashboard: 'Dashboard',
                orderHistory: 'Order History',
                training: 'Training',
                support: 'Support',
                phone: 'Phone',
                email: 'Email',
                helpCenter: 'Help Center',
                quickAccess: 'Quick Access',
                backToB2C: 'Back to User Portal',
                becomePartner: 'Become a Partner',
                readyToPartner: 'Ready to partner with us?',
                joinThousands: 'Join thousands of partners worldwide and grow your solar business with IBC SOLAR',
                contactSales: 'Contact Sales'
            }
        }
    };

    currentLanguage$ = this.currentLanguageSubject.asObservable();

    constructor() {
        // Check if there's a saved language preference
        const savedLanguage = localStorage.getItem('selectedLanguage') as SupportedLanguage;

        if (savedLanguage && (savedLanguage === 'hr' || savedLanguage === 'en')) {
            this.currentLanguageSubject.next(savedLanguage);
        }
    }

    getCurrentLanguage(): SupportedLanguage {
        return this.currentLanguageSubject.value;
    }

    setLanguage(language: SupportedLanguage): void {
        this.currentLanguageSubject.next(language);
        localStorage.setItem('selectedLanguage', language);
    }

    translate(key: string, params?: Record<string, string | number>): string {
        const currentLang = this.getCurrentLanguage();
        const translation = this.getNestedTranslation(this.translations[currentLang], key);

        if (typeof translation !== 'string') {
            console.warn(`Translation not found for key: ${key} in language: ${currentLang}`);
            return key;
        }

        // Replace parameters in translation
        if (params) {
            return Object.keys(params).reduce((text, paramKey) => {
                return text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(params[paramKey]));
            }, translation);
        }

        return translation;
    }

    private getNestedTranslation(obj: any, key: string): any {
        return key.split('.').reduce((o, i) => o?.[i], obj);
    }

    // Convenience method for templates
    t(key: string, params?: Record<string, string | number>): string {
        return this.translate(key, params);
    }
} 