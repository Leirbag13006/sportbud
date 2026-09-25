PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`sport_type` text NOT NULL,
	`description` text,
	`location_name` text,
	`address` text,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`equipment_required` integer DEFAULT false NOT NULL,
	`equipment_note` text,
	`audience` text DEFAULT 'all' NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`starts_at` integer NOT NULL,
	`duration_minutes` integer DEFAULT 60 NOT NULL,
	`required_level` text,
	`spots_total` integer NOT NULL,
	`spots_available` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "activities_sport_type_check" CHECK("__new_activities"."sport_type" in ('football', 'basketball', 'tennis', 'padel', 'badminton', 'volleyball', 'running', 'cycling', 'swimming', 'climbing', 'fitness', 'petanque', 'hiking', 'table_tennis', 'handball', 'rugby', 'yoga', 'other')),
	CONSTRAINT "activities_required_level_check" CHECK("__new_activities"."required_level" is null or "__new_activities"."required_level" in ('beginner', 'intermediate', 'pro')),
	CONSTRAINT "activities_status_check" CHECK("__new_activities"."status" in ('open', 'full', 'cancelled')),
	CONSTRAINT "activities_lat_range" CHECK("__new_activities"."lat" between -90 and 90),
	CONSTRAINT "activities_lng_range" CHECK("__new_activities"."lng" between -180 and 180),
	CONSTRAINT "activities_duration_range" CHECK("__new_activities"."duration_minutes" between 15 and 720),
	CONSTRAINT "activities_spots_total_range" CHECK("__new_activities"."spots_total" between 1 and 50),
	CONSTRAINT "activities_spots_available_range" CHECK("__new_activities"."spots_available" between 0 and "__new_activities"."spots_total"),
	CONSTRAINT "activities_status_matches_spots" CHECK("__new_activities"."status" = 'cancelled' or ("__new_activities"."status" = 'full') = ("__new_activities"."spots_available" = 0)),
	CONSTRAINT "activities_description_length" CHECK("__new_activities"."description" is null or length("__new_activities"."description") <= 500)
);
--> statement-breakpoint
INSERT INTO `__new_activities`("id", "creator_id", "sport_type", "description", "location_name", "address", "price_cents", "equipment_required", "equipment_note", "audience", "lat", "lng", "starts_at", "duration_minutes", "required_level", "spots_total", "spots_available", "status", "created_at", "updated_at") SELECT "id", "creator_id", "sport_type", "description", "location_name", "address", "price_cents", "equipment_required", "equipment_note", "audience", "lat", "lng", "starts_at", "duration_minutes", "required_level", "spots_total", "spots_available", "status", "created_at", "updated_at" FROM `activities`;--> statement-breakpoint
DROP TABLE `activities`;--> statement-breakpoint
ALTER TABLE `__new_activities` RENAME TO `activities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `activities_status_starts_at_idx` ON `activities` (`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `activities_creator_id_idx` ON `activities` (`creator_id`);