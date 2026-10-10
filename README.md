# Chorale Salve Regina — Application PWA de Cotisations & Dépôts

> **Plateforme PWA officielle pour les cotisations, offrandes et dons directs de la Chorale Salve Regina.**  
> Développée selon les principes **SOLID**, l'architecture **Hexagonale (Clean Architecture)** et les meilleures pratiques modernes : **Spring Boot (Java 21)** pour le backend et **Angular 19 (PWA)** pour le frontend.

---

## 🏛️ Architecture & Respect des Principes SOLID

Le projet est strictement séparé en deux modules autonomes dans le dossier dédié `salve-regina-pwa/` :
- `backend/` : API REST Spring Boot (Java 21, JPA, H2/PostgreSQL, Swagger OpenAPI)
- `frontend/` : Application PWA Angular 19 (Composants standalone, Signals, Tailwind CSS, Service Worker, Web App Manifest)

### Principes SOLID appliqués dans le Backend :
1. **S - Single Responsibility Principle (SRP)** :
   - Chaque cas d'utilisation a un port dédié (`EnregistrerVersementUseCase`, `ConsulterVersementUseCase`, `SynchroniserPaiementUseCase`).
   - Le validateur HMAC (`GeniusPaySignatureValidator`) ne fait que valider la signature cryptographique.
   - L'entité de domaine `Versement` encapsule ses propres règles invariantes (montant minimum, transitions d'état).
2. **O - Open/Closed Principle (OCP)** :
   - La passerelle de paiement implémente l'interface `PasserellePaiementPort`. L'ajout d'une nouvelle passerelle (ex: CinetPay, Stripe) se fait sans modifier le code métier du domaine.
3. **L - Liskov Substitution Principle (LSP)** :
   - Les implémentations de la passerelle de paiement et des adaptateurs de persistance sont totalement interchangeables vis-à-vis des interfaces de port.
4. **I - Interface Segregation Principle (ISP)** :
   - Découpage fin des interfaces de ports applicatifs plutôt qu'une interface "fourre-tout".
5. **D - Dependency Inversion Principle (DIP)** :
   - Le domaine pur (`domain/`) ne dépend ni de Spring, ni de JPA/Hibernate, ni de clients HTTP externes. Les couches d'infrastructure (`infrastructure/`) dépendent des abstractions du domaine (`ports`).

---

## 💳 Intégration de la Passerelle de Paiement (GeniusPay)

L'API de paiement réutilise et optimise l'intégration existante de `miracleapp` :
- **Appels REST direct** vers `POST https://geniuspay.ci/api/v1/merchant/payments` avec authentification par en-têtes `X-API-Key` et `X-API-Secret`.
- **Réseaux Mobile Money pris en charge** :
  - **Wave CI** (0% frais)
  - **Orange Money CI** (via Pawapay MMO `ORANGE_CIV`)
  - **MTN MoMo CI** (via Pawapay MMO `MTN_MOMO_CIV`)
  - **Moov Money CI** (via Pawapay MMO `MOOV_CIV`)
- **Mode Sandbox & Démo automatique** :
  - En environnement local sans réseau, l'application génère instantanément des sessions de test et valide les reçus pour une expérience fluide.
- **Webhooks & Signature HMAC-SHA256** :
  - Endpoint de réception instantanée : `POST /api/versements/webhook`.

---

## 📱 Fonctionnalités de l'Application PWA Frontend

- **Mobile First & PWA Installable** :
  - Manifeste Web (`manifest.webmanifest`) et Service Worker `@angular/service-worker`.
  - Bouton et bannière d'installation 1-clic pour smartphone (iOS / Android) et bureau.
- **Hero Card Sacré "20 Ans de Grâce"** :
  - Utilise la véritable photo de la Chorale Salve Regina en blanc (« Qui bene cantat, bis orat »).
- **Guichet Express Sans Compte** :
  - Sélection du motif : **Cotisation**, **Concert**, **Don Libre**.
  - Sélection rapide du pupitre : **Soprano**, **Alto**, **Ténor**, **Basse**, **Bienfaiteur**.
  - Saisie Mobile Money (+225) avec pastilles de montants prédéfinis (2 500, 5 000, 10 000 ou Montant Libre).
  - Sélection tactile des réseaux (Wave, Orange, MTN, Moov).
- **Suivi des Cotisations & Transparence** :
  - Filtre par pupitres en temps réel.
  - Statistiques financières communautaires : total collecté, répartition par pupitre, motif et opérateur.
  - **Reçu Numérique Officiel** instantané avec option d'impression PDF et partage.

---

## 🚀 Démarrage Rapide

### 1. Lancer le Backend (Spring Boot)
```bash
cd c:\francois\miracleapp\salve-regina-pwa\backend
.\gradlew bootRun
```
- L'API démarre sur le port **`8082`**.
- Documentation interactive Swagger : `http://localhost:8082/swagger-ui.html`
- Console H2 (base en mémoire) : `http://localhost:8082/h2-console`

### 2. Lancer le Frontend (Angular PWA)
```bash
cd c:\francois\miracleapp\salve-regina-pwa\frontend
npm start
```
- L'application est disponible sur : **`http://localhost:4200`**
