-- ============================================================================
-- JISP demo data — safe to delete/edit entirely from Admin > Products/Collections
-- Prices are in RM (Malaysian Ringgit).
-- ============================================================================

insert into collections (name, slug, description, cover_image_url, sort_order, is_visible)
values
  ('The Departure Edit', 'the-departure-edit', 'Foundational pieces for the first steps of the journey.', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200', 1, true),
  ('Formed Utility', 'formed-utility', 'Structured, functional pieces built for movement.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200', 2, true),
  ('Limited Sculptures', 'limited-sculptures', 'Small-batch, limited edition silhouettes.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200', 3, true)
on conflict (slug) do nothing;

insert into site_settings (
  hero_image_url, hero_title, hero_subtitle, hero_button_text,
  featured_collection_id, brand_story, about_content,
  instagram_url, whatsapp_url, contact_email,
  shipping_information, returns_information, footer_content
)
select
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600',
  'Journey in Sculpture',
  'Sculpted for the Journey.',
  'Shop Collection',
  (select id from collections where slug = 'the-departure-edit'),
  'JISP began as a study in movement — how a body is shaped by distance, by repetition, by the road. Every garment is treated as a piece of sculpture: cut, pressed, and finished to hold its form through the journey it is worn for.',
  'JISP (Journey in Sculpture) is a Malaysia-based studio designing considered, structural clothing for people in motion. We believe every product is a piece that gets shaped through the journeys of the person wearing it — worn in, broken in, made theirs.',
  'https://instagram.com/jisp',
  'https://wa.me/60123456789',
  'hello@jisp.com',
  'We ship nationwide within Malaysia (2–5 business days) and internationally (7–14 business days). Orders above RM250 ship free within Malaysia.',
  'Unworn items with tags attached can be returned within 14 days of delivery for a store credit or exchange. Sale items are final.',
  'JISP — Journey in Sculpture. Wear Your Journey.'
where not exists (select 1 from site_settings);

-- ----------------------------------------------------------------------------
-- Product 1: Split Curve Pants
-- ----------------------------------------------------------------------------
with p as (
  insert into products (
    name, slug, short_description, full_description, positioning, category, tags,
    regular_price, sale_price, cost_price, sku, sizes, colors,
    inventory_quantity, low_stock_threshold, material, care_instructions, size_guide,
    shipping_information, is_featured, is_new_arrival, is_limited_edition, is_published
  ) values (
    'Split Curve Pants', 'split-curve-pants',
    'Structured wide-leg trousers with a sculpted seam line.',
    'The Split Curve Pants are built around a single curved seam that wraps the leg, creating a sculptural silhouette that moves with the body. Cut from a heavyweight twill with just enough structure to hold its shape from morning commute to night.',
    'For the traveler who dresses with intention.',
    'Bottoms', array['pants','wide-leg','twill'],
    259.00, 219.00, 95.00, 'JISP-SCP-001', array['XS','S','M','L','XL'], array['Black','Stone Grey'],
    42, 5, '100% Cotton Twill', 'Machine wash cold, inside out. Do not bleach. Iron on medium heat.',
    'Runs true to size. If between sizes, size up for a relaxed fit.',
    'Ships within 2 business days.', true, true, false, true
  )
  returning id
)
insert into product_images (product_id, url, sort_order, is_main)
select id, url, sort_order, is_main from p, (values
  ('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200', 0, true),
  ('https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1200', 1, false)
) as imgs(url, sort_order, is_main);

-- ----------------------------------------------------------------------------
-- Product 2: Sculpted Oversized Tee
-- ----------------------------------------------------------------------------
with p as (
  insert into products (
    name, slug, short_description, full_description, positioning, category, tags,
    regular_price, sale_price, cost_price, sku, sizes, colors,
    inventory_quantity, low_stock_threshold, material, care_instructions, size_guide,
    shipping_information, is_featured, is_new_arrival, is_limited_edition, is_published
  ) values (
    'Sculpted Oversized Tee', 'sculpted-oversized-tee',
    'Heavyweight tee with a dropped, sculpted shoulder.',
    'A foundational piece re-engineered with a dropped shoulder seam and a boxier block, in a heavyweight jersey that holds its shape wash after wash. The essential layer of the JISP wardrobe.',
    'The everyday base layer for the journey.',
    'Tops', array['tee','essentials','oversized'],
    129.00, null, 42.00, 'JISP-SOT-001', array['S','M','L','XL'], array['Black','White','Dark Grey'],
    68, 8, '220gsm Cotton Jersey', 'Machine wash cold. Tumble dry low.',
    'Oversized fit — size down for a closer fit.',
    'Ships within 2 business days.', true, false, false, true
  )
  returning id
)
insert into product_images (product_id, url, sort_order, is_main)
select id, url, sort_order, is_main from p, (values
  ('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200', 0, true),
  ('https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200', 1, false)
) as imgs(url, sort_order, is_main);

-- ----------------------------------------------------------------------------
-- Product 3: Journey Jacket
-- ----------------------------------------------------------------------------
with p as (
  insert into products (
    name, slug, short_description, full_description, positioning, category, tags,
    regular_price, sale_price, cost_price, sku, sizes, colors,
    inventory_quantity, low_stock_threshold, material, care_instructions, size_guide,
    shipping_information, is_featured, is_new_arrival, is_limited_edition, is_published
  ) values (
    'Journey Jacket', 'journey-jacket',
    'Structured field jacket with articulated, sculpted sleeves.',
    'The Journey Jacket is cut with articulated sleeves that follow the natural bend of the arm, finished in a water-resistant twill with a reinforced collar. Designed to be the one jacket you reach for on every trip.',
    'One jacket. Every journey.',
    'Outerwear', array['jacket','outerwear','field-jacket'],
    459.00, 389.00, 165.00, 'JISP-JJ-001', array['S','M','L','XL'], array['Black','Olive'],
    5, 5, 'Water-Resistant Cotton Twill', 'Spot clean or dry clean only.',
    'Fitted through the body. Size up for layering.',
    'Ships within 3 business days.', true, true, true, true
  )
  returning id
)
insert into product_images (product_id, url, sort_order, is_main)
select id, url, sort_order, is_main from p, (values
  ('https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200', 0, true),
  ('https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1200', 1, false)
) as imgs(url, sort_order, is_main);

-- ----------------------------------------------------------------------------
-- Product 4: Formed Utility Bag
-- ----------------------------------------------------------------------------
with p as (
  insert into products (
    name, slug, short_description, full_description, positioning, category, tags,
    regular_price, sale_price, cost_price, sku, sizes, colors,
    inventory_quantity, low_stock_threshold, material, care_instructions, size_guide,
    shipping_information, is_featured, is_new_arrival, is_limited_edition, is_published
  ) values (
    'Formed Utility Bag', 'formed-utility-bag',
    'Structured crossbody with a molded, sculptural base.',
    'A compact utility bag with a molded base that holds its form empty or full. Multiple internal compartments are designed around how the journey actually unfolds — passport, phone, cables, all in place.',
    'Carry what shapes you.',
    'Accessories', array['bag','utility','crossbody'],
    329.00, null, 110.00, 'JISP-FUB-001', array[]::text[], array['Black','Sand'],
    0, 5, 'Coated Canvas, Vegetable-Tanned Leather Trim', 'Wipe clean with a damp cloth.',
    'One size. Approx. 24 x 18 x 8 cm.',
    'Ships within 2 business days.', false, false, false, true
  )
  returning id
)
insert into product_images (product_id, url, sort_order, is_main)
select id, url, sort_order, is_main from p, (values
  ('https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1200', 0, true),
  ('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200', 1, false)
) as imgs(url, sort_order, is_main);

-- ----------------------------------------------------------------------------
-- Link products to collections
-- ----------------------------------------------------------------------------
insert into product_collections (product_id, collection_id)
select pr.id, c.id from products pr, collections c
where pr.slug = 'split-curve-pants' and c.slug = 'the-departure-edit'
on conflict do nothing;

insert into product_collections (product_id, collection_id)
select pr.id, c.id from products pr, collections c
where pr.slug = 'sculpted-oversized-tee' and c.slug = 'the-departure-edit'
on conflict do nothing;

insert into product_collections (product_id, collection_id)
select pr.id, c.id from products pr, collections c
where pr.slug = 'journey-jacket' and c.slug = 'limited-sculptures'
on conflict do nothing;

insert into product_collections (product_id, collection_id)
select pr.id, c.id from products pr, collections c
where pr.slug = 'formed-utility-bag' and c.slug = 'formed-utility'
on conflict do nothing;

-- NOTE: Formed Utility Bag is seeded with inventory_quantity = 0 on purpose
-- so you can see the "Sold Out" badge/state working out of the box.
