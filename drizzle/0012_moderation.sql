ALTER TABLE `reports` ADD `resolution` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `resolved_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `suspended_at` integer;