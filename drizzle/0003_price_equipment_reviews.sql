CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`reviewee_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reviews_rating_range" CHECK("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_comment_length" CHECK("reviews"."comment" is null or length("reviews"."comment") <= 500),
	CONSTRAINT "reviews_not_self" CHECK("reviews"."reviewer_id" <> "reviews"."reviewee_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_activity_reviewee_unique` ON `reviews` (`activity_id`,`reviewee_id`);--> statement-breakpoint
CREATE INDEX `reviews_reviewee_id_idx` ON `reviews` (`reviewee_id`);--> statement-breakpoint
ALTER TABLE `activities` ADD `price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `activities` ADD `equipment_required` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `activities` ADD `equipment_note` text;