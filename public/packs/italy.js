/*
  Il Percorso — Italy content pack.

  Everything a reader sees lives here; engine.js only knows how to show it.

  How a field can be written:
    "plain text"                         same for everyone
    "text with {cityName}"               {cityName} etc. come from `vars` below; {verified} and
                                         {<question>Short} (the chosen option's `short`, or its label) are built in
    { by: "city", milano: "…", roma: "…" }            differs per answer
    { by: "visaType", "work,family": "…", default: "…" }  comma = several answers share it
  flag / notes: highlighted notes under the facts (text or a list). A variant's `flag` replaces the
  base flag; `notes` on the base step always show too.
  A step can also carry `variants` (same `by` idea) whose fields replace the base ones —
  except `discrepancy`, which is shown in addition to the step's own.

  source:  the main official source (shown as "Confirmed against …"). null = "Not yet checked".
  also:    extra official links shown under it (a list of keys from `sources`, or a { by } field).
  checked: the date this step was last checked against its sources.

  Source tiers for disagreements: "official", "legal" (immigration guide), "aggregator".
*/
window.PACK = {
  id: "italy",
  verified: "19 Oct 2026",   // default "checked" date; a step can override it with its own `checked`

  page: {
    title: "Il Percorso — trova la tua strada",
    description: "The paperwork for moving to Milano or Roma, step by step, in the order you'll do it — with an official source for every step.",
    meta: "Milano and Roma · in English · an independent guide · sources checked October 2026",
    heading: "Il Percorso",
    sub: "The paperwork for moving to Italy, in the order you'll actually do it — with sources, so you can check everything yourself.",
    button: "Show my steps",
    footer: "Each step links the official source it was checked against, with the date. Where reliable sources disagree, both claims are shown — check the official link before relying on either. Rules, fees and waiting times change; your Questura or Comune has the final word."
  },

  questions: [
    {
      id: "citizenship",
      label: "You are",
      options: [
        { val: "eu", label: "EU / EEA citizen", small: "No visa needed · free movement" },
        { val: "noneu", label: "Non-EU citizen", small: "Visa, then a permesso di soggiorno" }
      ]
    },
    {
      id: "visaType",
      label: "Your visa is for",
      showIf: { citizenship: "noneu" },
      options: [
        { val: "work", label: "Work", small: "A job in Italy, or self-employment · lavoro", short: "work visa" },
        { val: "family", label: "Family", small: "Joining family living in Italy · ricongiungimento", short: "family visa" },
        { val: "study", label: "Study", small: "University or a recognised course · studio", short: "study visa" },
        { val: "elective", label: "Elective residence", small: "Living on your own income, without working · residenza elettiva", short: "elective residence" },
        { val: "digitalnomad", label: "Digital nomad / remote work", small: "Working remotely, highly qualified · nomadi digitali", short: "digital nomad" },
        { val: "bluecard", label: "EU Blue Card", small: "Highly qualified job with a set minimum salary · Carta Blu UE", short: "EU Blue Card" }
      ]
    },
    {
      id: "city",
      label: "You're moving to",
      options: [
        { val: "milano", label: "Milano" },
        { val: "roma", label: "Roma" }
      ]
    }
  ],

  // Summary under "Your steps", e.g. "Non-EU · work visa · Milano"
  dossierTitle: {
    by: "citizenship",
    eu: "EU citizen · {cityName}",
    noneu: "Non-EU · {visaTypeShort} · {cityName}"
  },

  vars: {
    cityName: { by: "city", milano: "Milano", roma: "Roma" }
  },

  sources: {
    entrate: { name: "Agenzia delle Entrate — codice fiscale", url: "https://www.agenziaentrate.gov.it/portale/codice-fiscale-e-tessera-sanitaria/che-cos-cittadini" },
    polizia: { name: "Polizia di Stato — how, where and how much", url: "https://www.poliziadistato.it/articolo/come-dove-e-quanto-costa" },
    poliziaKit: { name: "Questura checklist — what goes in the kit postale (PDF, 2024)", url: "https://questure.poliziadistato.it/statics/29/documenti-da-inserire-nel-kit-postale-per-le-principali-tipologie-di-permesso-di-soggiorno.pdf" },
    poliziaStatus: { name: "Polizia di Stato — check where your permesso is", url: "https://questure.poliziadistato.it/stranieri/" },
    accordo: { name: "Accordo di integrazione — regulation DPR 179/2011 (Normattiva)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:2011-09-14;179" },
    tui5: { name: "Immigration law, art. 5 (Normattiva)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-07-25;286~art5" },
    tui27quater: { name: "Immigration law, art. 27-quater — EU Blue Card (Normattiva)", url: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-07-25;286~art27quater" },
    nomadi: { name: "Portale Integrazione Migranti — digital nomads and remote workers", url: "https://integrazionemigranti.gov.it/it-it/Ricerca-news/Dettaglio-news/id/3835/Chi-sono-i-nomadi-digitali-Con-quale-procedura-possono-fare-ingresso-in-Italia" },
    spid: { name: "SPID.gov.it — for citizens", url: "https://www.spid.gov.it/en/citizens/" },
    visti: { name: "Visto per l'Italia — Ministero degli Esteri", url: "https://vistoperitalia.esteri.it/" },
    comuneMilano: { name: "Comune di Milano — residency for people arriving from abroad", url: "https://www.comune.milano.it/servizi/anagrafe/cambio-di-residenza-per-persone-straniere-provenienti-dall-estero" },
    comuneMilanoDocs: { name: "Comune di Milano — forms and document lists", url: "https://www.comune.milano.it/servizi/anagrafe/richiesta-di-residenza-per-persone-straniere-provenienti-dall-estero/modulistica-richiesta-di-residenza-per-persone-straniere-provenienti-dall-estero" },
    comuneRoma: { name: "Roma Capitale — residency registration", url: "https://www.comune.roma.it/web/it/scheda-servizi.page?contentId=INF141216" },
    cie: { name: "Ministero dell'Interno — Carta d'Identità Elettronica", url: "https://www.cartaidentita.interno.gov.it/en/request-cie/release-and-renew-in-italy/" },
    cieBooking: { name: "Ministero dell'Interno — booking an ID card appointment online", url: "https://www.cartaidentita.interno.gov.it/en/request-cie/cie-online-booking/" },
    milanoCieNonEu: { name: "Comune di Milano — first ID card for non-EU citizens", url: "https://servizicrm.comune.milano.it/centro-supporto/KA-00393/Prima-CIE-per-cittadini-extra-UE-documenti-necessari" },
    saluteNonEu: { name: "Ministero della Salute — healthcare for non-EU citizens", url: "https://www.salute.gov.it/new/it/tema/assistenza-sanitaria-paesi-extra-ue/assistenza-ai-cittadini-dei-paesi-extra-ue-italia/" }
  },

  // Which steps, in which order, for which answers. First match wins.
  paths: [
    { when: { citizenship: "eu" }, steps: ["codicefiscale_eu", "residency_eu", "health_eu", "cie_eu", "spid_eu"] },
    { when: { citizenship: "noneu" }, steps: ["visa", "codicefiscale_noneu", "permesso", "health_noneu", "residency_noneu", "cie_noneu", "spid_noneu"] }
  ],

  steps: {

    /* ---------- EU path ---------- */

    codicefiscale_eu: {
      title: "Codice fiscale",
      meta: "Agenzia delle Entrate — by appointment",
      what: "Your Italian tax code. You'll be asked for it constantly — to sign a lease, get a phone contract, register with a doctor. It's a code, not an ID card; you get a printed certificate (certificato di attribuzione) to show until the card version arrives.",
      where: "Any Agenzia delle Entrate office (ufficio territoriale), by booking an in-person appointment. If you still live abroad, an Italian consulate can assign it instead.",
      docs: "A valid identity document (passport or EU ID card). People without a codice fiscale use form AA4/8.",
      cost: "The official page lists no fee.",
      time: "Assigned at your appointment, when you get the certificate. Appointment availability is usually the wait.",
      source: "entrate",
      discrepancy: {
        label: "Walk-in or appointment?",
        claims: [
          { text: "The Agenzia delle Entrate's own page says you must book an in-person appointment for a first codice fiscale, so they can identify you.", tier: "official" },
          { text: "Several relocation sites still describe it as a same-day walk-in with no appointment.", tier: "aggregator" }
        ]
      }
    },

    residency_eu: {
      title: "Iscrizione anagrafica (residency)",
      meta: { by: "city", milano: "Comune di Milano — online application", roma: "Roma Capitale — through your Municipio" },
      what: "Registering your address with the comune's population register (anagrafe). It makes you officially resident, and you need it for the Italian ID card. EU citizens staying more than three months register this way.",
      where: {
        by: "city",
        milano: "Milan takes this as an online application on the Comune di Milano website. Download the forms and document list first, then upload your documents as scans or photos (pdf, jpg, gif or tiff, max 7 MB each). Documents sent by email are not accepted.",
        roma: "Rome handles residency through its 15 Municipi — the one that covers your address. Apply online, by PEC (certified email), by registered post (raccomandata), or in person at your Municipio's office. Ordinary email has not been accepted since March 2022."
      },
      docs: {
        by: "city",
        milano: "Milan's official list for EU citizens: a valid ID or passport; your codice fiscale; proof of your housing (lease, deed, or the owner's/host's consent form); and either proof that you work (employed or self-employed) or, if you don't work, a declaration that you have enough money to live on plus health insurance valid in Italy for at least a year (or an EU form such as E106, E120 or E121). Family members need civil-status documents, translated and legalised. Students and other cases: see Milan's list.",
        roma: "Rome's page doesn't list documents itself — it points to its forms (modulistica). Expect the same national requirements as in Milan: ID, codice fiscale, proof of housing, and proof of work or of sufficient resources plus health insurance. Confirm with your Municipio."
      },
      cost: "No fee.",
      time: "The comune registers you within 2 working days of your application. It then has up to 45 days to check that you really live at the address (a home check, accertamento domiciliare).",
      source: { by: "city", milano: "comuneMilano", roma: "comuneRoma" },
      also: { by: "city", milano: ["comuneMilanoDocs"], roma: [] }
    },

    health_eu: {
      title: "Health service (SSN) and tessera sanitaria",
      meta: "Your local health authority (ASL)",
      what: "Registering with Italy's national health service (Servizio Sanitario Nazionale, SSN) lets you choose a family doctor (medico di base) and gives you a tessera sanitaria, the health card. For EU citizens, what you can register for depends on whether you work in Italy.",
      where: {
        by: "city",
        milano: "The 'Scelta e revoca' (choose your doctor) desk of the health authority covering your address — in Milan, the ASST local offices.",
        roma: "The 'Scelta e revoca' (choose your doctor) desk of your local health authority — in Rome, ASL Roma 1, 2 or 3, depending on your address."
      },
      docs: "If you work in Italy: ID, codice fiscale, proof of residence, and proof of your job or self-employment. If you don't: your European Health Insurance Card (TEAM/EHIC) only covers temporary stays; for residency you need private health insurance or an EU entitlement form from your home country (Milan's list names E106, E120 and E121) — Milan's residency list asks for one of these.",
      cost: "Free if you register because you work. Otherwise, private insurance or a voluntary yearly contribution — check with the ASL.",
      time: "Usually at the desk, once you have your documents.",
      source: null,
      flag: "We haven't yet found the Health Ministry's current page for EU citizens, so this step is marked as not yet checked. The insurance requirement for non-workers is confirmed in Milan's official residency document list."
    },

    cie_eu: {
      title: "Carta d'identità elettronica (CIE)",
      meta: "Comune — after you're registered as resident",
      what: "The Italian electronic ID card. It's optional for EU citizens, but it's the simplest way to get SPID and is accepted everywhere in Italy.",
      where: "Your comune's registry office. Where your comune uses it, book through the Interior Ministry's online booking system (linked below).",
      docs: "Your codice fiscale or tessera sanitaria, one passport-style photo (paper, or on a USB stick), and another valid ID document. You must already be registered as resident.",
      cost: "€16.79 for the card, plus the comune's own fees where they apply. At most comuni the total is about €22.21; we couldn't confirm Milan's or Rome's exact figure on their own pages.",
      time: "Printed by the State mint and sent to you: you can collect it at the comune after 6 working days, or have it delivered to an address you choose.",
      source: "cie",
      also: ["cieBooking"]
    },

    spid_eu: {
      title: "SPID",
      meta: "An accredited identity provider",
      what: "Italy's digital identity. You'll use it to log in to public services online — tax, pensions, healthcare and comune services.",
      where: "Pick a provider (for example PosteID from Poste Italiane) and complete identity recognition in person, by video, or with your electronic ID card.",
      docs: "A valid Italian identity document (in practice, the CIE above), your codice fiscale, a personal email address and mobile number.",
      cost: "Free when you're identified at public offices or post-office counters. Private providers' commercial outlets charge for recognition.",
      time: "Signing up takes minutes; the identity check is the slow part.",
      source: "spid",
      discrepancy: {
        label: "Which ID counts",
        claims: [
          { text: "SPID.gov.it says you need a valid Italian document. It doesn't list which ones.", tier: "official" },
          { text: "Provider help pages (e.g. InfoCert) list an Italian ID card, Italian passport or Italian driving licence — which means a foreign EU passport on its own usually isn't enough.", tier: "legal" }
        ]
      },
      flag: "Get the Italian ID card (CIE) first — it's the Italian document most EU newcomers can get."
    },

    /* ---------- Non-EU path ---------- */

    visa: {
      title: "Entry visa (before you arrive)",
      meta: "The Italian consulate where you live now",
      what: "You need the right long-stay visa (visto nazionale, type D) before you travel. The Foreign Ministry's portal, Visto per l'Italia, asks your nationality, where you live, how long you'll stay and why, and tells you which visa you need and what to bring.",
      where: "The Italian embassy or consulate for the country where you live now (not necessarily your country of citizenship). Many consulates book appointments through the Foreign Ministry's Prenot@mi system (prenotami.esteri.it).",
      docs: {
        by: "visaType",
        "work,family,bluecard": "The official portal lists the documents for your case. Your employer (work, Blue Card) or family member (family) first gets a nulla osta — an approval from the Sportello Unico per l'Immigrazione in Italy. Self-employed workers follow a different route; check the portal.",
        digitalnomad: "No nulla osta needed. You'll need proof of at least six months' experience in your remote work, health insurance valid in Italy, housing, and the minimum income — see the permesso step.",
        default: "The official portal lists the documents for your exact situation."
      },
      cost: "Depends on the visa and consulate.",
      time: "Weeks to months. Some university and employer guides advise starting up to 120 days ahead; consulate appointments are often the bottleneck.",
      source: "visti",
      also: { by: "visaType", digitalnomad: ["nomadi"], default: [] }
    },

    codicefiscale_noneu: {
      title: "Codice fiscale",
      meta: { by: "visaType", "work,family,bluecard": "Usually assigned at the Sportello Unico", default: "Assigned by the Questura, or ask the Agenzia" },
      what: {
        by: "visaType",
        "work,family,bluecard": "Your Italian tax code. If you came in with a nulla osta for a job (including the Blue Card) or for family reunification, the Sportello Unico per l'Immigrazione assigns it — usually you don't need to ask for it separately. Self-employed? The Questura assigns it when you apply for your permesso.",
        default: "Your Italian tax code. The Questura assigns it when you apply for your permesso di soggiorno. If you need it sooner (for a lease, for example), you can request it at any Agenzia delle Entrate office."
      },
      where: "Sportello Unico per l'Immigrazione or the Questura, depending on your visa — or any Agenzia delle Entrate office by appointment if you request it yourself.",
      docs: "If you request it yourself: your passport with visa (or your permesso). People without a codice fiscale use form AA4/8.",
      cost: "The official page lists no fee.",
      time: "If you request it yourself, it's assigned at your appointment. Otherwise it comes with your permesso paperwork.",
      source: "entrate"
    },

    permesso: {
      title: "Permesso di soggiorno",
      meta: "Within 8 working days of arriving",
      docs: "Passport with your visa (copies of all pages with data, visas and stamps), the application form (moduli 1 and 2, in block capitals), proof of the reason for your stay, proof of where you'll live (host declaration and lease), a €16 marca da bollo, and the postal payment slip. Put copies in the envelope, not originals — bring the originals and passport photos to your Questura appointment.",
      source: "tui5",
      also: ["polizia", "poliziaKit", "poliziaStatus", "accordo"],
      notes: "If you're 16 or older and your permit is for a year or more, you also sign an integration agreement (Accordo di integrazione) when you apply — at the Sportello Unico for work and family entries, at the Questura otherwise. You start with 16 credits and need at least 30 within two years, mainly through Italian language and civic knowledge. You'll be invited to a free civic-education session within three months; missing it costs 15 credits.",
      discrepancy: {
        label: "How long it takes",
        claims: [
          { text: "The law (art. 5, para. 9) says the permit should be issued within 90 days of your application.", tier: "official" },
          { text: "Immigration guides commonly report several months in big cities like Milan and Rome. You can track your application on the Polizia di Stato portal.", tier: "legal" }
        ]
      },
      flag: "Keep the post-office receipt (ricevuta) with you. By law (art. 5, para. 9-bis), while your application is pending it lets you stay legally — and work, if your permit allows it — and with your passport and visa it lets you travel to your home country (per the Polizia di Stato).",
      variants: {
        by: "visaType",
        "work,family": {
          meta: "Sportello Unico, then post office, then Questura {cityName}",
          what: "The permit that makes your stay legal. Italian law gives you 8 working days from entering Italy to apply. If you're employed or joining family, start at the Sportello Unico per l'Immigrazione at the Prefettura: employees sign their residence contract (contratto di soggiorno) there, and an officer fills in the permit application with you. You then post it yourself in the kit postale at a post office. Self-employed (lavoro autonomo)? You skip the Sportello Unico and post the kit yourself.",
          where: "Sportello Unico per l'Immigrazione at the Prefettura di {cityName}, then a post office with a Sportello Amico counter. The Questura then calls you in for photos and fingerprints (fotosegnalamento).",
          cost: "€116.46 for a permit of up to 1 year, €126.46 for 1 to 2 years: €16 marca da bollo + €30 postal fee + a payment slip of €70.46 or €80.46 (€30.46 for the electronic card plus a €40 or €50 contributo).",
          time: "Apply within 8 working days of arriving."
        },
        bluecard: {
          title: "Permesso di soggiorno — Carta Blu UE",
          meta: "Nulla osta, then Sportello Unico, then Questura {cityName}",
          what: "The EU Blue Card is the permit for highly qualified employees. Your employer applies first for a nulla osta from the Sportello Unico per l'Immigrazione; by law it must be issued or refused within 30 days. With it you get your visa. Within 8 working days of arriving, you sign your residence contract (contratto di soggiorno) at the Sportello Unico and apply for the card.",
          where: "Sportello Unico per l'Immigrazione at the Prefettura di {cityName}, then the Questura for photos and fingerprints (fotosegnalamento).",
          cost: "About €176.46 if the €100 contributo applies (immigration guides place highly qualified workers in that band; the Questura checklist we found doesn't cover the Blue Card), otherwise €116.46–126.46.",
          time: "Nulla osta within 30 days of your employer's application (art. 27-quater, para. 6), then visa, then apply within 8 working days of arriving.",
          source: "tui27quater",
          also: ["tui5", "polizia", "poliziaStatus", "accordo"],
          flag: "The card is valid 2 years with a permanent contract, or the length of your contract plus 3 months otherwise. Your job offer must be for at least 6 months. Keep the post-office receipt with you while you wait: by law (art. 5, para. 9-bis) it lets you stay and work legally until the card is ready.",
          discrepancy: {
            label: "Minimum salary for the Blue Card",
            claims: [
              { text: "The law (art. 27-quater, para. 5) sets no fixed number: your salary must be at least the national collective contract (CCNL) rate for the job and at least the average gross annual salary published by ISTAT.", tier: "official" },
              { text: "A regional government page (Regione Friuli Venezia Giulia) gives the latest figure as €36,278.51 a year, without a clear date.", tier: "official" },
              { text: "Immigration consultancies cite €33,500 rising to €35,500; older guides still say about €27,000.", tier: "legal" }
            ]
          }
        },
        digitalnomad: {
          meta: "Questura {cityName} — within 8 working days",
          what: "Your permit says 'nomade digitale' (self-employed) or 'lavoratore da remoto' (employee). There's no nulla osta to wait for, but the clock is strict: apply directly at the Questura within 8 working days of arriving. You can start working once you have the application receipt.",
          where: "Directly at the Questura di {cityName}, the provincial police headquarters. The government's integration portal mentions no kit postale for this permit. Fingerprints (fotosegnalamento) follow, as for any permit.",
          cost: "Probably €116.46 for a 1-year permit (the €40 contributo band in the Questura checklist), but check with your Questura — this permit isn't on the checklist we found.",
          time: "Apply within 8 working days of arriving. The permit lasts 1 year and can be renewed every year while you still meet the requirements.",
          source: "nomadi",
          also: ["tui5", "poliziaStatus", "accordo"],
          flag: "Your employer or clients can be abroad or in Italy, and you can change employer. Digital nomads (self-employed) need an Italian VAT number (partita IVA). You also need health insurance valid in Italy and at least six months' prior experience.",
          discrepancy: {
            label: "How much income you need",
            claims: [
              { text: "The government's integration portal: at least three times the income threshold for healthcare co-payment exemption, currently €8,263.31 — so €24,789 a year for a single person without dependants.", tier: "official" },
              { text: "The Italian embassy in Pristina's visa page puts the base amount at €8,500 (about €25,500 a year).", tier: "official" },
              { text: "Many immigration guides still quote about €28,000 a year.", tier: "legal" }
            ]
          }
        },
        default: {
          meta: "Post office (kit postale), then Questura {cityName}",
          what: "The permit that makes your stay legal. Italian law gives you 8 working days from entering Italy to apply. For a study or elective-residence permit you apply yourself: pick up the application envelope (kit postale) at a post office, fill it in, and send it from a post office with a Sportello Amico counter.",
          where: "Any post office with a Sportello Amico counter. The Questura di {cityName} then calls you in for photos and fingerprints (fotosegnalamento).",
          cost: {
            by: "visaType",
            study: "€116.46: €16 marca da bollo + €30 postal fee + a €70.46 payment slip (€30.46 for the electronic card plus a €40 contributo), per the Questura checklist.",
            default: "€126.46: €16 marca da bollo + €30 postal fee + an €80.46 payment slip (€30.46 for the electronic card plus a €50 contributo), per the Questura checklist."
          },
          docs: {
            by: "visaType",
            study: "Per the Questura checklist: passport copies (all pages with data, visas and stamps), host declaration and lease, proof of enrolment, health insurance for your whole stay or proof of voluntary SSN registration, proof of funds, a €16 marca da bollo and the €70.46 payment slip. Copies in the envelope; originals to your Questura appointment.",
            default: "Per the Questura checklist: passport copies (all pages with data, visas and stamps), proof that you have enough money to live on, a €16 marca da bollo and the €80.46 payment slip. Copies in the envelope; originals to your Questura appointment."
          },
          time: "Apply within 8 working days of arriving."
        }
      }
    },

    health_noneu: {
      title: "Health service (SSN) and tessera sanitaria",
      meta: { by: "visaType", "work,family,bluecard": "Mandatory registration — free", "study,elective": "Voluntary registration or private insurance", default: "Check which applies to you" },
      what: {
        by: "visaType",
        "work,family,bluecard": "Registering with Italy's national health service (Servizio Sanitario Nazionale, SSN) gives you a family doctor (medico di base) and a tessera sanitaria, the health card. With a work or family permit, registration is mandatory and free — and you can do it while your first permit is still being processed.",
        "study,elective": "Registering with Italy's national health service (Servizio Sanitario Nazionale, SSN) gives you a family doctor (medico di base) and a tessera sanitaria. With a study or elective-residence permit you're not registered automatically: you either keep private health insurance valid in Italy, or register voluntarily by paying a yearly contribution.",
        default: "Registering with Italy's national health service (Servizio Sanitario Nazionale, SSN) gives you a family doctor and a tessera sanitaria. Whether a digital nomad / remote-work permit counts for mandatory registration isn't spelled out on the official page — your visa already requires private health insurance valid in Italy, so keep that until your ASL confirms."
      },
      where: {
        by: "city",
        milano: "The 'Scelta e revoca' (choose your doctor) desk of the health authority covering your address — in Milan, the ASST local offices. If you're not yet resident, use the address on your permit.",
        roma: "The 'Scelta e revoca' (choose your doctor) desk of your local health authority — in Rome, ASL Roma 1, 2 or 3, depending on your address. If you're not yet resident, use the address on your permit."
      },
      docs: {
        by: "visaType",
        "work,bluecard": "Your permesso, or the post-office receipt for your first work permit; a self-declaration of residence (or the address on your permit); and your codice fiscale.",
        family: "Your entry visa, the post-office receipt for your permit application, a copy of the nulla osta from the Sportello Unico, and your codice fiscale.",
        default: "Your permesso (or receipt), codice fiscale, proof of address, and — for voluntary registration — the payment receipt (paid with an F24 form)."
      },
      cost: {
        by: "visaType",
        "work,family,bluecard": "Free. As for Italians, specialist visits carry a co-payment (ticket) unless you're exempt.",
        "study,elective": "Voluntary registration is a yearly contribution covering one calendar year (1 January to 31 December). It can't be split and isn't backdated. The official page doesn't state the amounts.",
        default: "Depends on whether you register voluntarily — ask your ASL."
      },
      time: "Usually done at the desk. The health card lasts as long as your permit.",
      source: "saluteNonEu",
      discrepancy: {
        by: "visaType",
        "study,elective": {
          label: "How much voluntary registration costs",
          claims: [
            { text: "The Ministry of Health says voluntary registration means paying a yearly contribution set by law (Budget Law 2024, art. 1 para. 240) — but its page doesn't give the amounts.", tier: "official" },
            { text: "Universities and immigration guides report €700 a year for students with no income other than grants, and at least €2,000 a year for most other people (including elective residence) since 2024.", tier: "legal" }
          ]
        },
        default: null
      }
    },

    residency_noneu: {
      title: "Iscrizione anagrafica (residency)",
      meta: { by: "city", milano: "Comune di Milano — online application", roma: "Roma Capitale — through your Municipio" },
      what: {
        by: "visaType",
        "work,family,bluecard": "Registering your address with the comune's population register (anagrafe). It makes you officially resident, and you need it for the Italian ID card. In Milan, employees and family-reunification applicants can register while their first permit is still pending, using the post-office receipt.",
        default: "Registering your address with the comune's population register (anagrafe). It makes you officially resident, and you need it for the Italian ID card. Milan's official list only accepts a first-permit receipt for employees and family reunification — with a study, elective-residence, digital-nomad or self-employment permit, expect to need the permit itself."
      },
      where: {
        by: "city",
        milano: "Milan takes this as an online application on the Comune di Milano website. Download the forms and document list first, then upload your documents as scans or photos (pdf, jpg, gif or tiff, max 7 MB each). Documents sent by email are not accepted.",
        roma: "Rome handles residency through its 15 Municipi — the one that covers your address. Apply online, by PEC (certified email), by registered post (raccomandata), or in person at your Municipio's office. Ordinary email has not been accepted since March 2022."
      },
      docs: {
        by: "city",
        milano: "Milan's official list for non-EU citizens: passport; your valid permit (or, if renewing, the expired permit plus the renewal receipt); codice fiscale; proof of housing (lease, deed, or the owner's/host's consent form). Waiting for a first permit as an employee: your contratto di soggiorno, the post-office receipt and your Sportello Unico application. Waiting for a family permit: your visa, the post-office receipt and a copy of the nulla osta. Family members also need civil-status documents, translated and legalised.",
        roma: "Rome's page doesn't list documents itself — it points to its forms (modulistica). Expect the same national requirements as in Milan: passport, permit (or the receipt where allowed), codice fiscale and proof of housing. Confirm with your Municipio."
      },
      cost: "No fee.",
      time: "The comune registers you within 2 working days of your application. It then has up to 45 days to check that you really live at the address (a home check, accertamento domiciliare).",
      source: { by: "city", milano: "comuneMilano", roma: "comuneRoma" },
      also: { by: "city", milano: ["comuneMilanoDocs"], roma: [] }
    },

    cie_noneu: {
      title: "Carta d'identità elettronica (CIE)",
      meta: "Comune — after you're registered as resident",
      what: "The Italian electronic ID card. Once you're resident you can get one with your permit. It's the Italian document SPID asks for, and it's accepted everywhere in Italy.",
      where: "Your comune's registry office. Where your comune uses it, book through the Interior Ministry's online booking system (linked below).",
      docs: {
        by: "city",
        milano: "Milan's official list for a first card: tessera sanitaria or codice fiscale, one paper passport-style photo, your permesso di soggiorno (the card itself — if it has expired, the renewal receipt), and another valid ID such as your passport.",
        roma: "Your permesso di soggiorno, another valid ID such as your passport, your codice fiscale or tessera sanitaria, and one passport-style photo (paper, or on a USB stick). Milan's official list asks for the permit card itself on a first application."
      },
      cost: "€16.79 for the card, plus the comune's own fees where they apply. At most comuni the total is about €22.21; we couldn't confirm Milan's or Rome's exact figure on their own pages.",
      time: "Printed by the State mint and sent to you: you can collect it at the comune after 6 working days, or have it delivered to an address you choose.",
      source: "cie",
      also: { by: "city", milano: ["milanoCieNonEu", "cieBooking"], roma: ["cieBooking"] }
    },

    spid_noneu: {
      title: "SPID",
      meta: "An accredited identity provider",
      what: "Italy's digital identity. You'll use it to log in to public services online — tax, pensions (INPS), healthcare, comune services and the citizenship portal.",
      where: "Pick a provider (for example PosteID from Poste Italiane) and complete identity recognition in person, by video, or with your electronic ID card.",
      docs: "The Italian ID card (CIE), your codice fiscale, a personal email address and mobile number.",
      cost: "Free when you're identified at public offices or post-office counters. Private providers' commercial outlets charge for recognition.",
      time: "Signing up takes minutes once you have the ID card — the card is the real wait.",
      source: "spid",
      discrepancy: {
        label: "Can you use your permesso instead of an Italian ID?",
        claims: [
          { text: "SPID.gov.it says foreigners use their residence permit to get an Italian document, and then use that document to activate SPID.", tier: "official" },
          { text: "Immigration guides agree that the permesso alone isn't accepted and the Italian ID card is needed first.", tier: "legal" },
          { text: "One relocation site says PosteID accepts a passport plus residence permit directly.", tier: "aggregator" }
        ]
      },
      flag: "Get the Italian ID card (CIE) first — that's the route the official page describes."
    }
  }
};
