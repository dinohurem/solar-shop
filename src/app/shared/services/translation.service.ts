import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
                signOut: 'Odjavite se'
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
                title: 'Ponude i promocije',
                subtitle: 'Otkrijte nevjerojatne ponude na naše premium solarne i energetski učinkovite proizvode',
                viewAll: 'Pogledaj sve',
                sale: 'RASPRODAJA',
                youSave: 'Uštedite {{amount}}',
                addToCart: 'Dodaj u košaricu',
                viewDetails: 'Pogledaj detalje',
                noOffers: 'Nema dostupnih ponuda',
                noOffersText: 'Provjerite kasnije za nevjerojatne ponude na naše proizvode.',
                dontMissOut: 'Ne propustite!',
                subscribeText: 'Pretplatite se na naš newsletter i budite prvi koji će saznati za nove ponude i ekskluzivne ponude.',
                enterEmail: 'Unesite vaš email',
                subscribe: 'Pretplatite se',
                allCategories: 'Sve kategorije',
                solarPanels: 'Solarni paneli',
                inverters: 'Izmjenjivači',
                batteries: 'Baterije',
                accessories: 'Pribor',
                offersAvailable: '{{count}} ponuda dostupno',
                browseAllProducts: 'Pregledaj sve proizvode'
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
                subscribeNewsletter: 'Pretplatite se na naš newsletter'
            },
            // Blog
            blog: {
                title: 'Blog i vodiči',
                subtitle: 'Dobrodošli u Blog i vodiči sekciju SolarShop-a, vašu referencu za uvide, praktične savjete i korisne informacije.',
                allPosts: 'Sve objave',
                loading: 'Učitavanje članaka...',
                unableToLoad: 'Nije moguće učitati članke',
                tryAgain: 'Pokušajte ponovno',
                loadMore: 'Učitaj više članaka',
                featured: 'Istaknuto',
                relatedArticles: 'Povezani članci',
                shareArticle: 'Podijelite ovaj članak',
                facebook: 'Facebook',
                twitter: 'Twitter',
                linkedin: 'LinkedIn',
                backToBlog: 'Natrag na blog',
                articleNotFound: 'Članak nije pronađen',
                stayUpdated: 'Ostanite ažurni',
                newsletterText: 'Primajte najnovije uvide i savjete o solarnoj energiji direktno u svoj inbox.',
                whatYouFind: 'Što ćete pronaći u ovoj sekciji?',
                technicalGuides: 'Tehnički vodiči',
                technicalGuidesText: 'Korak po korak, naučite instalirati solarne panele, zamijeniti podove ili poboljšati toplinsku izolaciju svog doma.',
                regulationsInsights: 'Uvidi u propise i poticaje',
                regulationsText: 'Ostanite ažurni o poreznim olakšicama, propisima o okolišu i poticajima za energetsku rehabilitaciju.',
                sustainabilityTips: 'Savjeti za održivost',
                sustainabilityText: 'Praktični savjeti za čini vaš dom efikasnijim i ekološki prihvatljivijim.',
                caseStudies: 'Studije slučaja i priče o uspjehu',
                caseStudiesText: 'Pogledajte projekte realizirane s našim proizvodima, otkrijte kako su drugi kupci transformirali svoje prostora.',
                faqTutorials: 'FAQ i video tutorijali',
                faqText: 'Pronađite brze odgovore na vaša najčešća pitanja. Zahvaljujući video tutorijalima.',
                trustedPartner: 'Vaš pouzdani partner',
                partnerText: 'Naš cilj je pružiti vam jasne, pouzdane i ažurne informacije, pomažući vam donijeti informirane izbore.'
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
                total: 'Ukupno',
                proceedToCheckout: 'Nastavi na naplatu',
                itemAddedToCart: 'Proizvod dodan u košaricu!',
                adding: 'Dodavanje...',
                openCart: 'Otvori košaricu',
                freeShipping: 'Besplatna dostava',
                freeShippingProgress: 'Dodajte još {{amount}} za besplatnu dostavu!'
            },
            // Checkout
            checkout: {
                title: 'Naplata',
                step1: 'Informacije o dostavi',
                step2: 'Način plaćanja',
                step3: 'Pregled narudžbe',
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
                orderSummary: 'Sažetak narudžbe',
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
                signOut: 'Sign Out'
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
                subtitle: 'Discover amazing deals on our premium solar and energy-efficient products',
                viewAll: 'View All',
                sale: 'SALE',
                youSave: 'You save {{amount}}',
                addToCart: 'Add To Cart',
                viewDetails: 'View Details',
                noOffers: 'No offers available',
                noOffersText: 'Check back later for amazing deals on our products.',
                dontMissOut: 'Don\'t Miss Out!',
                subscribeText: 'Subscribe to our newsletter and be the first to know about new offers and exclusive deals.',
                enterEmail: 'Enter your email',
                subscribe: 'Subscribe',
                allCategories: 'All Categories',
                solarPanels: 'Solar Panels',
                inverters: 'Inverters',
                batteries: 'Batteries',
                accessories: 'Accessories',
                offersAvailable: '{{count}} offers available',
                browseAllProducts: 'Browse All Products'
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
                subscribeNewsletter: 'Subscribe to Our Newsletter'
            },
            // Blog
            blog: {
                title: 'Blog & Guides',
                subtitle: 'Welcome to the Blog & Guides section of SolarShop, your reference point for insights, practical advice and useful information.',
                allPosts: 'All Posts',
                loading: 'Loading articles...',
                unableToLoad: 'Unable to Load Articles',
                tryAgain: 'Try Again',
                loadMore: 'Load More Articles',
                featured: 'Featured',
                relatedArticles: 'Related Articles',
                shareArticle: 'Share this article',
                facebook: 'Facebook',
                twitter: 'Twitter',
                linkedin: 'LinkedIn',
                backToBlog: 'Back to Blog',
                articleNotFound: 'Article Not Found',
                stayUpdated: 'Stay Updated',
                newsletterText: 'Get the latest solar energy insights and tips delivered to your inbox.',
                whatYouFind: 'What you\'ll find in this section?',
                technicalGuides: 'Technical Guides',
                technicalGuidesText: 'Step by step, learn to install solar panels, replace flooring or improve the thermal insulation of your home.',
                regulationsInsights: 'Regulations and Incentives Insights',
                regulationsText: 'Stay updated on tax deductions, environmental regulations and incentives for energy requalification.',
                sustainabilityTips: 'Sustainability Tips',
                sustainabilityText: 'Practical advice to make your home more efficient and environmentally friendly.',
                caseStudies: 'Case Studies and Success Stories',
                caseStudiesText: 'Take a look at projects realized with our products, discover how other customers have transformed their spaces.',
                faqTutorials: 'FAQ and Video Tutorials',
                faqText: 'Find quick answers to your most common doubts. Thanks to video tutorials.',
                trustedPartner: 'Your trusted partner',
                partnerText: 'Our goal is to provide you with clear, reliable and up-to-date information, helping you make informed choices.'
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
                total: 'Total',
                proceedToCheckout: 'Proceed to Checkout',
                itemAddedToCart: 'Item added to cart!',
                adding: 'Adding...',
                openCart: 'Open cart',
                freeShipping: 'Free shipping',
                freeShippingProgress: 'Add {{amount}} more for free shipping!'
            },
            // Checkout
            checkout: {
                title: 'Checkout',
                step1: 'Shipping Information',
                step2: 'Payment Method',
                step3: 'Order Review',
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
                orderSummary: 'Order Summary',
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