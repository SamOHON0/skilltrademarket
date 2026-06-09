-- Skill Trade seed data: launch trade categories (PRD open item 14, suggested list).
-- James to confirm the final list; slugs are stable, names/questions editable.

insert into trade_categories (slug, name, sort_order, questions) values
  ('plumbing', 'Plumbing', 1, '[
    {"key": "job_type", "label": "What kind of plumbing job?", "type": "select", "options": ["Leak or burst pipe", "Bathroom installation", "Boiler or heating", "Tap or toilet repair", "Other"]},
    {"key": "property_type", "label": "Property type", "type": "select", "options": ["House", "Apartment", "Commercial"]}
  ]'),
  ('electrical', 'Electrical', 2, '[
    {"key": "job_type", "label": "What kind of electrical work?", "type": "select", "options": ["Sockets or switches", "Lighting", "Fuse board", "EV charger", "Rewiring", "Safety cert", "Other"]},
    {"key": "property_type", "label": "Property type", "type": "select", "options": ["House", "Apartment", "Commercial"]}
  ]'),
  ('carpentry', 'Carpentry', 3, '[
    {"key": "job_type", "label": "What kind of carpentry?", "type": "select", "options": ["Doors or frames", "Built-in storage", "Flooring", "Decking", "Furniture repair", "Other"]}
  ]'),
  ('painting', 'Painting & Decorating', 4, '[
    {"key": "scope", "label": "What needs painting?", "type": "select", "options": ["One room", "Several rooms", "Whole interior", "Exterior", "Other"]},
    {"key": "prep", "label": "Any prep needed (wallpaper removal, repairs)?", "type": "select", "options": ["Yes", "No", "Not sure"]}
  ]'),
  ('tiling', 'Tiling', 5, '[
    {"key": "area", "label": "Where is the tiling?", "type": "select", "options": ["Bathroom", "Kitchen", "Floor", "Outdoor", "Other"]},
    {"key": "size", "label": "Rough area size", "type": "select", "options": ["Small (under 5 sqm)", "Medium (5-15 sqm)", "Large (over 15 sqm)", "Not sure"]}
  ]'),
  ('plastering', 'Plastering', 6, '[
    {"key": "job_type", "label": "What kind of plastering?", "type": "select", "options": ["Skim coat", "Patch repair", "Full room", "External render", "Other"]}
  ]'),
  ('roofing', 'Roofing', 7, '[
    {"key": "job_type", "label": "What kind of roofing work?", "type": "select", "options": ["Leak repair", "Tile or slate replacement", "Flat roof", "Gutters and fascia", "Full reroof", "Other"]}
  ]'),
  ('landscaping', 'Landscaping & Gardening', 8, '[
    {"key": "job_type", "label": "What kind of work?", "type": "select", "options": ["Garden maintenance", "Patio or paving", "Decking", "Fencing", "Full redesign", "Other"]}
  ]'),
  ('handyman', 'General Handyman', 9, '[
    {"key": "job_type", "label": "Briefly, what kind of jobs?", "type": "select", "options": ["Assembly", "Repairs", "Hanging and fixing", "Odd jobs list", "Other"]}
  ]');
