CREATE TABLE `user_achievements` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`tier` integer NOT NULL,
	`unlocked_at` integer NOT NULL,
	`seen_at` integer,
	PRIMARY KEY(`user_id`, `achievement_id`, `tier`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "user_achievements_tier_range" CHECK("user_achievements"."tier" between 1 and 3)
);
