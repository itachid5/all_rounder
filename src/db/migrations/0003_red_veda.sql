DROP INDEX `roles_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `roles_tenant_slug_unique` ON `roles` (`tenant_id`,`slug`);