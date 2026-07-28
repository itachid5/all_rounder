CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`account_number` text,
	`bank_name` text,
	`branch` text,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`current_balance` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`reference_no` text,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`collection_no` text NOT NULL,
	`date` integer NOT NULL,
	`customer_id` text NOT NULL,
	`account_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`reference_no` text,
	`notes` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer_ledgers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`reference_id` text,
	`reference_no` text,
	`debit` real DEFAULT 0 NOT NULL,
	`credit` real DEFAULT 0 NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`customer_code` text NOT NULL,
	`name` text NOT NULL,
	`mobile` text,
	`alternative_mobile` text,
	`whatsapp_number` text,
	`email` text,
	`address` text,
	`previous_due` real DEFAULT 0 NOT NULL,
	`notes` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_customer_mobile_unique` ON `customers` (`tenant_id`,`mobile`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_customer_code_unique` ON `customers` (`tenant_id`,`customer_code`);--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`expense_no` text NOT NULL,
	`expense_date` text NOT NULL,
	`category_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`reference_no` text,
	`paid_to` text,
	`notes` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`reference_type` text NOT NULL,
	`reference_id` text,
	`reference_no` text,
	`quantity` real NOT NULL,
	`previous_stock` real NOT NULL,
	`new_stock` real NOT NULL,
	`unit_cost` real NOT NULL,
	`total_value` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_adjustments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`adjustment_no` text NOT NULL,
	`date` integer NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`system_stock` real NOT NULL,
	`actual_stock` real NOT NULL,
	`difference` real NOT NULL,
	`reason` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`purchase_id` text NOT NULL,
	`product_id` text NOT NULL,
	`purchase_price` real DEFAULT 0 NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`invoice_no` text NOT NULL,
	`date` integer NOT NULL,
	`supplier_id` text NOT NULL,
	`sub_total` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`transport_cost` real DEFAULT 0 NOT NULL,
	`other_charges` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`due_amount` real DEFAULT 0 NOT NULL,
	`payment_method` text,
	`reference_no` text,
	`notes` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`sale_id` text NOT NULL,
	`product_id` text NOT NULL,
	`selling_price` real DEFAULT 0 NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`item_discount` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`invoice_no` text NOT NULL,
	`date` integer NOT NULL,
	`customer_id` text NOT NULL,
	`sub_total` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`other_charges` real DEFAULT 0 NOT NULL,
	`grand_total` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`due_amount` real DEFAULT 0 NOT NULL,
	`payment_method` text,
	`reference_no` text,
	`notes` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_ledgers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`reference_id` text,
	`reference_no` text,
	`debit` real DEFAULT 0 NOT NULL,
	`credit` real DEFAULT 0 NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`payment_no` text NOT NULL,
	`date` integer NOT NULL,
	`supplier_id` text NOT NULL,
	`account_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`reference_no` text,
	`notes` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`supplier_code` text NOT NULL,
	`name` text NOT NULL,
	`mobile` text,
	`alternative_mobile` text,
	`whatsapp_number` text,
	`email` text,
	`address` text,
	`previous_due` real DEFAULT 0 NOT NULL,
	`notes` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_mobile_unique` ON `suppliers` (`tenant_id`,`mobile`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_supplier_code_unique` ON `suppliers` (`tenant_id`,`supplier_code`);--> statement-breakpoint
ALTER TABLE `products` ADD `current_stock` integer DEFAULT 0 NOT NULL;