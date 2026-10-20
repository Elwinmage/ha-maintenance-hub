# ha-maintenance-hub — Spécification v1

Intégration Home Assistant (domaine `maintenance_hub`) et carte Lovelace
(`custom:maintenance-hub-card`) pour suivre les tâches d'entretien hors
aquarium : maison, piscine, chauffage, climatisation, arrosage…

Le rendu et les mécanismes reprennent la vue maintenance de `ha-reef-card`
via un module partagé (`ha-maintenance-ui`). Le principe des deux stockages
(définitions dans `entry.options`, état dans un `Store`) reprend celui de
`reef_maintenance`.

---

## 1. Dépôts et distribution

| Dépôt | Rôle | Distribution |
|---|---|---|
| `Elwinmage/ha-maintenance-hub` | intégration + carte embarquée | HACS, catégorie **Integration** |
| `Elwinmage/ha-maintenance-ui` | module front partagé (types, logique, vue Lit, i18n) | dépendance npm git (`github:Elwinmage/ha-maintenance-ui#<tag>`) |
| `Elwinmage/ha-reef-card` | consommera `ha-maintenance-ui` (étape ultérieure) | inchangé |

La carte est **servie par l'intégration** :

```
custom_components/maintenance_hub/frontend/maintenance-hub-card.js   ← build de frontend/
```

`async_setup` enregistre le chemin statique `/maintenance_hub/frontend` et
ajoute le module via `frontend.add_extra_js_url` (avec `?v=<version>` pour
casser le cache). L'utilisateur n'ajoute aucune ressource Lovelace.

---

## 2. Modèle

```
Emplacement (config entry)          ex. "Maison", "Maison de vacances", "Piscine"
 └─ Device                          device HA existant OU device manuel
     └─ Tâche                       une entité sensor
```

### 2.1 Emplacement

- Une entrée de config par emplacement. `entry.data = {"name": str}`.
- Un device « hub » par emplacement : identifiant `(maintenance_hub, <entry_id>)`,
  modèle « Location ». Les devices manuels y sont rattachés par `via_device`.

### 2.2 Device

Stocké dans `entry.options["devices"]` :

```json
{
  "id": "a1b2c3",                 // stable, généré à la création
  "name": "Pompe de filtration",  // devices manuels ; ignoré si ha_device_id résolu
  "ha_device_id": "f00…" | null,  // device HA auquel rattacher les tâches
  "template": "pool_pump" | null, // modèle du catalogue utilisé à la création
  "tasks": [
    {"key": "pool_prefilter_clean"},                 // tâche du catalogue
    {"key": "custom_3f9a", "label": "Graisser l'axe", "unit": "months", "value": 6}
  ]
}
```

- **Device HA** : les entités sont rattachées au device existant via
  `Entity.device_entry` (même mécanisme que les helpers HA) : le device n'est
  pas « réclamé » par l'entrée, il reste à son intégration. Les tâches
  apparaissent sur la page du device. Si le device HA disparaît, on retombe
  sur un device manuel portant le dernier nom connu.
- **Device manuel** : identifiant `(maintenance_hub, <entry_id>_<id>)`,
  `via_device` = hub de l'emplacement.

### 2.3 Tâche

Une tâche = **une entité `sensor`**, `device_class: timestamp`.
`unique_id = <entry_id>_<device_id>_<task_key>`.

- Tâches du catalogue : nom pris dans le catalogue, dans la langue de HA au
  chargement.
- Tâches custom : `key = custom_<slug>`, nom = libellé saisi.

---

## 3. Récurrence

Unités : `days`, `weeks`, `months`, `years`. Calcul **calendaire** (un mois
ajouté au 31 janvier donne le 28/29 février), jamais via des multiples de
jours.

### 3.1 Glissante (pas d'ancre)

```
échéance = last_reset + valeur × unité
jamais faite → pas d'échéance (state unknown, days_left null)
```

### 3.2 Saisonnière (ancre `MM-DD`)

Réservée à l'unité `years`. Les occurrences sont les dates d'ancre de chaque
année ; la tâche revient tous les `valeur` ans.

```
seuil    = last_reset + (valeur × 12 − 6) mois
échéance = première date d'ancre ≥ date(seuil)
jamais faite → prochaine date d'ancre à partir d'aujourd'hui (incluse)
```

Exemples (ancre 15/10, 1 an) : faite le 20/10/2026 → 15/10/2027 ; faite
tôt le 01/10/2026 → 15/10/2027 ; faite très en retard le 10/01/2027 →
15/10/2027.

L'ancre est modifiable par l'utilisateur. Pas de décalage automatique
hémisphère sud.

### 3.3 Grandeurs dérivées

```
days_left     = (date(échéance) − date(aujourd'hui)).days   (négatif = en retard)
interval_days = (date(échéance) − date(début de cycle)).days
                début de cycle = last_reset (glissante) / échéance − période (saisonnière)
overdue       = days_left < 0
```

Les attributs sont recalculés chaque jour à 00:00:05 (heure locale).

---

## 4. Contrat d'entité (sensor)

`state` : échéance ISO-8601 (timezone-aware), `unknown` si jamais faite
(glissante).

| Attribut | Type | Description |
|---|---|---|
| `maint_role` | str | `maint_<task_key>` — marqueur de détection pour la carte |
| `task_key` | str | clé du catalogue ou `custom_<slug>` |
| `frequency_unit` | str | `days` \| `weeks` \| `months` \| `years` |
| `frequency_value` | int | ≥ 1 |
| `anchor` | str \| null | `MM-DD` pour une tâche saisonnière |
| `interval_days` | int | durée du cycle courant en jours |
| `days_left` | int \| null | jours restants, négatif si en retard |
| `overdue` | bool | |
| `last_reset` | str \| null | ISO-8601 |
| `notify` | bool | alertes actives pour cette tâche |
| `regulatory` | bool | obligation réglementaire (affichée par la carte) |
| `location_id` | str | `entry_id` de l'emplacement |
| `location_name` | str | nom de l'emplacement |

`icon` vient du catalogue (ou `mdi:wrench-check` pour une tâche custom).

Le marqueur est volontairement `maint_role` et non `reef_role` : la vue
maintenance de `ha-reef-card` n'affiche donc pas ces tâches, alors que la
carte du hub affiche les deux (cf. §8).

---

## 5. Services

Toutes les écritures passent par le `Store`, sans recharger l'entrée.

| Service | Champs | Effet |
|---|---|---|
| `maintenance_hub.reset` | `entity_id` (liste), `last_reset` (datetime, optionnel) | marque fait, maintenant ou à la date donnée |
| `maintenance_hub.set_frequency` | `entity_id`, `unit`, `value` (1–999), `anchor` (`MM-DD` ou vide) | change la récurrence ; une ancre exige `unit = years` |
| `maintenance_hub.set_notify` | `entity_id`, `notify` (bool) | active/coupe les alertes de la tâche |

---

## 6. To-do par emplacement

Une entité `todo.<emplacement>` par entrée :

- liste les tâches **en retard ou dans la fenêtre d'alerte**
  (`days_left ≤ max(1, round(interval_days × 0.2))`, même règle que la carte) ;
- les tâches jamais faites sans échéance n'y figurent pas ;
- `due` = date d'échéance, `summary` = « Device · Tâche » ;
- cocher une ligne (`COMPLETED`) appelle `reset` ;
- **seule** `UPDATE_TODO_ITEM` est déclarée : pas de création ni de
  suppression d'items depuis l'UI To-do.

---

## 7. Catalogue

`custom_components/maintenance_hub/catalog.json`, noms multilingues
embarqués (repli sur `en`).

```json
{
  "version": 1,
  "tasks": {
    "pool_prefilter_clean": {
      "name": {"en": "Clean pump pre-filter basket", "fr": "Nettoyer le panier du pré-filtre"},
      "icon": "mdi:filter-variant",
      "unit": "weeks", "value": 1
    },
    "pool_winterize": {
      "name": {"en": "Winterize", "fr": "Hivernage"},
      "icon": "mdi:snowflake",
      "unit": "years", "value": 1, "anchor": "10-15"
    },
    "boiler_service": {
      "name": {"en": "Annual boiler service", "fr": "Entretien annuel de la chaudière"},
      "icon": "mdi:water-boiler",
      "unit": "years", "value": 1, "anchor": "09-01", "regulatory": true
    }
  },
  "templates": {
    "pool_filtration": {
      "name": {"en": "Pool pump & filtration", "fr": "Piscine : pompe et filtration"},
      "category": "pool",
      "icon": "mdi:pool",
      "tasks": ["pool_prefilter_clean", "pool_winterize"]
    }
  }
}
```

- Une tâche de modèle peut surcharger les valeurs :
  `{"key": "…", "value": 2, "unit": "weeks"}`.
- **Catalogue utilisateur** : `<config>/maintenance_hub/catalog.json`, même
  format, fusionné par-dessus (ajout ou remplacement de clés).
- La fréquence par défaut est copiée dans le `Store` à la création de la
  tâche : une mise à jour du catalogue ne modifie pas une tâche existante.

---

## 8. Flux de configuration

**Création (config flow)** : nom de l'emplacement → entrée créée.

**Options (menu)** :

1. **Ajouter un device**
   - étape `add` : device HA (sélecteur, optionnel) **ou** nom libre ; modèle
     du catalogue (optionnel) ;
   - étape `tasks` : tâches du catalogue (multi-sélection, présélection depuis
     le modèle) + tâches custom (zone de texte, une par ligne :
     `Libellé` ou `Libellé ; valeur ; unité`).
2. **Modifier un device** : choix du device, puis mêmes champs (nom, tâches).
3. **Supprimer un device**.

La fréquence et l'ancre ne sont **pas** dans le flux d'options : elles se
règlent depuis la carte (ou le service `set_frequency`).

---

## 9. Stockage

- `entry.options["devices"]` : définitions (cf. §2.2). Modification →
  rechargement de l'entrée.
- `Store` `maintenance_hub_<entry_id>` (version 1) :

```json
{
  "<device_id>|<task_key>": {
    "last_reset": "2026-10-19T09:30:00+02:00" | null,
    "unit": "weeks", "value": 1, "anchor": null,
    "notify": true
  }
}
```

Les entrées orphelines (tâche retirée) sont purgées au chargement.

---

## 10. Module partagé `ha-maintenance-ui`

### 10.1 Contenu

```
src/
  types.ts         MaintenanceItem, MaintenanceStatus, options de vue…
  core.ts          statut, pourcentage, tri, regroupement, filtres, compteurs, signature
  backend.ts       interface MaintenanceBackend
  backends/reef.ts contrat reef_role (bouton + number + switch) — porté de ha-reef-card
  backends/hub.ts  contrat maint_role (sensor + services maintenance_hub)
  i18n.ts          dictionnaires (de, en, es, fr, it, pl, pt)
  view.ts          <maintenance-view> (LitElement), rendu de ha-reef-card
  styles.ts        styles de la vue
```

### 10.2 Interface backend

```ts
interface MaintenanceBackend {
  readonly id: string;                                  // "reef" | "hub"
  collect(hass, options): MaintenanceItem[];
  reset(hass, item, date?: Date): void;
  setFrequency(hass, item, freq: FrequencyChange): void;
  setNotify(hass, item, notify: boolean): void;
}
```

`MaintenanceItem` reprend l'existant de `ha-reef-card` et ajoute :

| Champ | Description |
|---|---|
| `backend` | `"reef"` \| `"hub"` |
| `location_id`, `location_name` | `null` pour reef (regroupés sous l'emplacement configuré, « Aquarium » par défaut) |
| `regulatory` | bool |
| `frequency` | `{ mode: "slider", unit, value, min, max, step }` (reef) ou `{ mode: "free", unit, value, anchor }` (hub) ; `null` si non éditable |

Chaque bundle enregistre la vue sous **son propre tag**
(`define_maintenance_view("maintenance-hub-view")`, plus tard
`"reef-maintenance-view"` dans ha-reef-card) : deux cartes embarquant deux
versions différentes du module ne se disputent jamais un même nom d'élément.
Le bundler doit dédupliquer `lit` (`resolve.dedupe: ["lit"]`).

La vue ne connaît que les items. L'éditeur de fréquence affiche le curseur
(reef, identique à l'existant) ou le formulaire unité + valeur + ancre (hub).

### 10.3 Rendu

Identique à la vue reef (en-tête, compteurs, barre d'outils, lignes, barre de
progression colorée, cloche, bouton fait, éditeur repliable), avec :

- un niveau **emplacement** au-dessus des groupes de devices en tri « par
  équipement », et un sélecteur d'emplacement dans la barre d'outils s'il y en
  a plusieurs ;
- en tri « par échéance », sous-titre « Device · Emplacement » ;
- une icône `mdi:scale-balance` à côté du nom pour les tâches réglementaires.

---

## 11. Carte `maintenance-hub-card`

```yaml
type: custom:maintenance-hub-card
title: Entretien             # optionnel
locations: []                # entry_id ou noms ; vide = tous
include_reef: true           # agréger les tâches reef_role
reef_location: Aquarium      # nom du groupe des tâches reef
sort: device                 # device | due
hide_ok: false
hide_muted: false
warning_ratio: 0.2
show_reset: true
show_notify: true
show_interval: true
```

Éditeur visuel : titre, emplacements, inclusion reef, valeurs par défaut des
filtres.

---

## 12. Hors périmètre v1

- Migration de `ha-reef-card` vers `ha-maintenance-ui`.
- Blueprint de notification (base : déclencheur `time` sur le sensor +
  attribut `notify`).
- Historique des réalisations (qui, quand, note).
- Création d'items depuis la to-do.
