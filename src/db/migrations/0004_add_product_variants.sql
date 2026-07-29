CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`current_stock` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `inventory_movements` ADD `variant_id` text;--> statement-breakpoint
ALTER TABLE `stock_adjustments` ADD `variant_id` text;--> statement-breakpoint
ALTER TABLE `products` ADD `has_variants` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `purchase_items` ADD `variant_id` text;--> statement-breakpoint
ALTER TABLE `sale_items` ADD `variant_id` text;