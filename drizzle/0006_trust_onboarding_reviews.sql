CREATE TABLE `blocks` (
	`blocker_id` text NOT NULL,
	`blocked_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`blocker_id`, `blocked_id`),
	FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "blocks_not_self" CHECK("blocks"."blocker_id" <> "blocks"."blocked_id")
);
--> statement-breakpoint
CREATE INDEX `blocks_blocked_id_idx` ON `blocks` (`blocked_id`);--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `password_reset_tokens_user_id_idx` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`reported_id` text NOT NULL,
	`reason` text NOT NULL,
	`details` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reported_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reports_reason_check" CHECK("reports"."reason" in ('no_show', 'inappropriate', 'harassment', 'fake_profile', 'unsafe', 'other')),
	CONSTRAINT "reports_details_length" CHECK("reports"."details" is null or length("reports"."details") <= 1000),
	CONSTRAINT "reports_not_self" CHECK("reports"."reporter_id" <> "reports"."reported_id")
);
--> statement-breakpoint
CREATE INDEX `reports_reported_id_idx` ON `reports` (`reported_id`);--> statement-breakpoint
DROP INDEX `reviews_activity_reviewee_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_activity_reviewer_reviewee_unique` ON `reviews` (`activity_id`,`reviewer_id`,`reviewee_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `city` text;--> statement-breakpoint
ALTER TABLE `users` ADD `home_lat` real;--> statement-breakpoint
ALTER TABLE `users` ADD `home_lng` real;--> statement-breakpoint
ALTER TABLE `users` ADD `onboarded_at` integer;