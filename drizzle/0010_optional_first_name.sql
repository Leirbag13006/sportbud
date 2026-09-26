PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text,
	`username` text DEFAULT '' NOT NULL,
	`gender` text,
	`bio` text,
	`sport_level` text DEFAULT 'beginner' NOT NULL,
	`avatar_url` text,
	`favorite_sports` text DEFAULT '[]' NOT NULL,
	`city` text,
	`home_lat` real,
	`home_lng` real,
	`onboarded_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "users_sport_level_check" CHECK("__new_users"."sport_level" in ('beginner', 'intermediate', 'pro')),
	CONSTRAINT "users_full_name_length" CHECK("__new_users"."full_name" is null or length(trim("__new_users"."full_name")) between 2 and 80),
	CONSTRAINT "users_bio_length" CHECK("__new_users"."bio" is null or length("__new_users"."bio") <= 500)
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password_hash", "full_name", "username", "gender", "bio", "sport_level", "avatar_url", "favorite_sports", "city", "home_lat", "home_lng", "onboarded_at", "created_at", "updated_at") SELECT "id", "email", "password_hash", "full_name", "username", "gender", "bio", "sport_level", "avatar_url", "favorite_sports", "city", "home_lat", "home_lng", "onboarded_at", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (lower("username"));