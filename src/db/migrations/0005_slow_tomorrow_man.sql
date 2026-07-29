ALTER TABLE `product_variants` ADD `opening_stock` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `variant_inventory_mode` text DEFAULT 'PRODUCT_LEVEL' NOT NULL;