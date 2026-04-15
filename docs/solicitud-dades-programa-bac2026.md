Hola,

Necessito que em doneu les dades de tots els events i expositors del BAC per poder-los posar a l'APP.

Necessito que m'envieu les dades en format JSON tal com l'especifico a continuació. Per als **events**, el format és el següent:

```json
{
  "id": "evt_001",
  "title": "Títol de l'event",
  "description": "Descripció llarga de l'event.",
  "category": "viveBAC",
  "activity_type": "talk",
  "start_time": "2026-07-07T09:30:00",
  "end_time": "2026-07-07T10:30:00",
  "local_location": "Auditorium",
  "location": "https://maps.app.goo.gl/...",
  "exhibitor_ids": ["spk_001", "biz_002"]
}
```

Descripció dels camps:

- `id`: identificador únic de l'event, format `evt_XXX` (ex. `evt_001`, `evt_002`…)
- `title`: títol de l'activitat o event
- `description`: descripció llarga de l'event
- `category`: categoria de l'event (`viveBAC`, `bioBAC`, `expoBAC` o `businessBAC`)
- `activity_type`: tipus d'activitat — tria un dels següents:
  - `talk` → ponència
  - `round_table` → taula rodona
  - `stand` → stand
  - `activity` → activitat d'interior
  - `outdoor_activity` → activitat a l'aire lliure
  - Podeu posar altres tipus di cap us encaixa
- `start_time` / `end_time`: data i hora d'inici i fi en format `YYYY-MM-DDTHH:MM:00`
- `local_location`: nom de la sala o espai dins del recinte
- `location`: enllaç de Google Maps (només si és fora del recinte principal, opcional)
- `exhibitor_ids`: llista d'IDs dels expositors associats a l'event (ponents, empreses…)

---

Per als **expositors** (ponents i empreses), el format és:

```json
{
  "id": "spk_001",
  "exhibitor_type": "speaker",
  "name": "Nom complet",
  "photo": "URL o nom de fitxer",
  "description": "Breu biografia o descripció.",
  "sponsor_tier": "gold"
}
```

Descripció dels camps:

- `id`: identificador únic de l'expositor — usa `spk_XXX` per a ponents i `biz_XXX` per a empreses/institucions
- `exhibitor_type`: tipus d'expositor (`speaker` per a ponent, `business` per a empresa o institució)
- `name`: nom complet de la persona o nom de l'empresa
- `photo`: foto o logotip (adjunta el fitxer o facilita una URL, mínim 400×400 px, opcional)
- `description`: biografia o descripció breu
- `sponsor_tier`: nivell de patrocini — només per a empreses: `platinum`, `gold`, `silver` o `bronze` (opcional, deixa'l buit si no és patrocinador)

---

Moltes gràcies!
