# Kako staviti Aspidus aplikaciju na telefon

Ovo je aplikacija tipa **PWA** (Progressive Web App). To znači da se
instalira direktno iz telefonskog pregledača — **bez App Store-a i bez
Google Play-a**, na i Androidu i na iPhoneu.

**Morate je prvo staviti na internet** (na pravu web adresu), pa onda
telefonom otvorite tu adresu i kliknete "Dodaj na početni ekran".

---

## OPCIJA 1 — Brzi test ODMAH na telefonu (privremeno)

Dok je aplikacija otvorena u ovom okruženju, iznad Preview panela sa desne
strane postoji dugme **"Open in New Tab"**. Ono vam daje link.

1. Kliknite "Open in New Tab" — otvoriće se u novom prozoru pregledača.
2. Kopirajte taj link (adresu iz gore iz trake).
3. Pošaljite ga sebi na telefon (preko Viber, WhatsApp, email…).
4. Otvorite ga na telefonu.
5. Pogledajte donji deo ovog fajla — **"Instalacija na telefonu"**.

⚠️ **Ovo je samo za testiranje.** Link je privremen i prestaje da radi kad
se ova sesija zatvori. Za trajnu instalaciju idite na Opciju 2.

---

## OPCIJA 2 — Trajna instalacija (preporučeno)

Besplatno i trajno, preko servisa **Vercel** (najbolji besplatni hosting
za ovakve aplikacije). Dobićete pravu internet adresu koja radi zauvek.

### Korak 1 — Preuzmite projekat na svoj kompjuter

Morate imati sve fajlove projekta na svom kompjuteru. Ako ne znate kako,
najlakše preko **GitHub-a**:

1. Idite na **github.com** i napravite nalog (besplatno, samo email).
2. Kliknite **"+"** gore desno → **"New repository"**.
3. Imenujte ga `aspidus-app`, kliknite **"Create repository"**.
4. Sada morate ubaciti sve fajlove ovog projekta u taj repozitorijum.
   - Ako imate projekat kao ZIP fajl na kompjuteru, raspakujte ga.
   - Na GitHub-u kliknite **"uploading an existing file"**.
   - Prevucite sve fajlove (osim foldera `node_modules` i `.next` ako ih ima).
   - Kliknite **"Commit changes"**.

> 💡 Ako vam je ovo komplikovano, postoji i lakši način sa GitHub Desktop
> programom — opisan na github.com/apps/desktop.

### Korak 2 — Povežite sa Vercel-om (besplatno)

1. Idite na **vercel.com** i kliknite **"Sign Up"**.
2. Kliknite **"Continue with GitHub"** (koristite isti GitHub nalog).
3. Dozvolite pristup.
4. Kliknite **"Add New..."** → **"Project"**.
5. Pod "Import Git Repository" videćete vaš `aspidus-app` — kliknite
   **"Import"**.
6. **Ništa ne menjajte** — Vercel sam prepoznaje da je Next.js projekat.
7. Kliknite **"Deploy"**.

Sačekajte 1–2 minuta. Videćete čestitke "Congratulations!" i dobićete
**pravu internet adresu**, npr.:
```
https://aspidus-app-vasime.vercel.app
```

To je vaša trajna adresa aplikacije. Otvorite je na telefonu.

### Korak 3 — Instalacija na telefonu

Otvorite tu adresu u pregledaču telefona:

#### Na ANDROID-u (Chrome):
1. Otvorite link u Chrome.
2. Sačekajte da se aplikacija učita.
3. Ili će se pojaviti **"Install App"** dugme na dnu (kliknite ga),
   ili idite u meni **⋮** (gore desno) → **"Add to Home screen"**.
4. Potvrdite. Ikona "A" se pojavi na početnom ekranu.

#### Na iPHONE-u (Safari — mora Safari, ne Chrome):
1. Otvorite link u **Safari**.
2. Sačekajte da se učita.
3. Pritisnite **"Share"** dugme (kvadrat sa strelicom gore, dole na traci).
4. Skrolujte i kliknite **"Add to Home Screen"** (Dodaj na početni ekran).
5. Potvrdite. Ikona "A" se pojavi na početnom ekranu.

### Korak 4 — Korišćenje

Sad imate aplikaciju kao da je iz App Store-a:
- Ikona na početnom ekranu.
- Otvara se preko celog ekrana (bez trake pregledača).
- Prvi put traži "Face ID" — samo kliknite na ikonu otiska.
- Sve što uradite (transakcije, podešavanja) se čuva na telefonu.

---

## Pitanja i odgovori

**Da li mogu da promenim izgled ili tekst?**
Da, ali to zahteva malo rada u kodu. Recite mi šta želite da promenim i
ja ću to uradim za vas — ne morate sami da dirate kod.

**Da li podaci nestaju kad zatvorim aplikaciju?**
Ne. Balans, transakcije i podešavanja se čuvaju na samom telefonu
(u lokalnoj memoriji pregledača). Ako obrišete podatke pregledača ili
uklonite aplikaciju, onda se resetuju na početne vrednosti.

**Da li ovo radi bez interneta?**
Delimično. Aplikacija se učita i bez interneta (service worker je kešira),
ali pravi bankarski podaci bi zahtevali server. Ovo je demo/demo verzija
sa simuliranim podacima.

**Mogu li da koristim na više telefona?**
Da — samo otvorite istu Vercel adresu na drugom telefonu i instalirajte.
Ali podaci se ne dele između telefona (svaki ima svoju lokalnu memoriju).

**Koliko novaca košta ovo?**
Besplatno. Vercel besplatni plan (Hobby) je dovoljan za ličnu/demo
upotrebu. Ne traži kreditnu karticu.
