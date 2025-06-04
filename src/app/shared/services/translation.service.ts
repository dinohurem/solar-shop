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
                offers: 'Ponude i Promocije',
                sustainability: 'Održivost',
                blog: 'Blog i Vodiči',
                company: 'Kompanija',
                contact: 'Kontakt i Podrška',
                searchPlaceholder: 'Traži proizvode...'
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
            // Profile
            profile: {
                profile: 'Profil',
                adminDashboard: 'Admin nadzorna ploča',
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
                addFirstPayment: 'Dodajte svoj prvi način plaćanja za početak'
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
                tryAgain: 'Pokušajte ponovno'
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
                mainTitle: 'Ekološki materijali za zeleniju budućnost',
                subtitle: 'Otkrijte naš asortiman održivih građevinskih rješenja, dizajniranih za smanjenje utjecaja na okoliš uz održavanje izuzetne kvalitete i stila.',
                exploreProducts: 'Istražite proizvode',
                loading: 'Učitavanje...'
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
                subtotal: 'Međuzbroj',
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
                step1: 'Informacije o dostavi',
                step2: 'Način plaćanja',
                step3: 'Pregled narudžbe',
                orderSummary: 'Sažetak narudžbe',
                subtotal: 'Međuzbroj',
                tax: 'Porez',
                total: 'Ukupno',
                personalInfo: 'Osobne informacije',
                firstName: 'Ime',
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
                bankTransfer: 'Bankovni transfer',
                cardNumber: 'Broj kartice',
                expiryDate: 'Datum isteka',
                cvv: 'CVV',
                placeOrder: 'Naruči',
                processing: 'Obrađujemo...',
                orderPlaced: 'Narudžba je uspješno poslana!',
                orderNumber: 'Broj narudžbe: {{number}}',
                backToStep: 'Nazad na {{step}}',
                nextStep: 'Sljedeći korak'
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
                technicalSupportText: 'Ako želite direktniji kontakt, ili ako vaš projekt zahtijeva specifičnu tehničku podršku, možete posjetiti jedan od naših izložbenih salona ili centara za pomoć, gdje možete razgovarati s našim stručnjacima i vidjeti proizvode izbliza.',
                viewNearestPoint: 'Pogledajte najbliže mjesto',
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
                bottomCta: 'Kakva god da je vaša potreba, tim SolarShop-a spreman je pomoći vam. Kontaktirajte nas danas i pustite da vas vodimo prema rješenju najpriklkladnijem vašim potrebama. Gradnja ili renoviranje nikad nije bilo lakše, sigurnije i zadovoljnije.'
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
                certificates: 'Certifikati',
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
                certifications: 'Certifikati',
                quantity: 'Količina',
                addToCart: 'Dodaj u košaricu',
                addToWishlist: 'Dodaj na listu želja',
                freeShipping: 'Besplatna dostava',
                twoYearWarranty: '2 godine jamstva',
                easyReturns: 'Jednostavan povrat',
                // Product Photos
                zoomImage: 'Povećaj sliku'
            }
        },
        en: {
            // Navigation
            nav: {
                products: 'Products',
                offers: 'Offers & Promotions',
                sustainability: 'Sustainability',
                blog: 'Blog & Guides',
                company: 'Company',
                contact: 'Contacts & Support',
                searchPlaceholder: 'Search products...'
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
                addFirstPayment: 'Add your first payment method for starting'
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
                tryAgain: 'Try again'
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
                mainTitle: 'Eco-Friendly Materials For A Greener Tomorrow',
                subtitle: 'Discover our range of sustainable building solutions, designed to reduce environmental impact while maintaining exceptional quality and style.',
                exploreProducts: 'Explore Products',
                loading: 'Loading...'
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
                step1: 'Shipping Information',
                step2: 'Payment Method',
                step3: 'Order Review',
                orderSummary: 'Order Summary',
                subtotal: 'Subtotal',
                tax: 'Tax',
                total: 'Total',
                personalInfo: 'Personal Information',
                firstName: 'First Name',
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
                bankTransfer: 'Bank Transfer',
                cardNumber: 'Card Number',
                expiryDate: 'Expiry Date',
                cvv: 'CVV',
                placeOrder: 'Place Order',
                processing: 'Processing...',
                orderPlaced: 'Order placed successfully!',
                orderNumber: 'Order number: {{number}}',
                backToStep: 'Back to {{step}}',
                nextStep: 'Next Step'
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
                viewNearestPoint: 'View the nearest point',
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
                freeShipping: 'Free shipping',
                twoYearWarranty: '2-year warranty',
                easyReturns: 'Easy returns',
                // Product Photos
                zoomImage: 'Zoom Image'
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