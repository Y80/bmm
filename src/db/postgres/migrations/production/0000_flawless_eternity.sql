DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('admin', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"role" "role" DEFAULT 'user'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publicBookmarkToTag" (
	"bId" serial NOT NULL,
	"tId" serial NOT NULL,
	CONSTRAINT "publicBookmarkToTag_bId_tId_pk" PRIMARY KEY("bId","tId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publicBookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"icon" varchar(255),
	"pinyin" varchar(255),
	"description" varchar(255),
	"createdAt" timestamp,
	"updatedAt" timestamp,
	CONSTRAINT "publicBookmarks_name_unique" UNIQUE("name"),
	CONSTRAINT "publicBookmarks_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publicTagToTag" (
	"a" serial NOT NULL,
	"b" serial NOT NULL,
	CONSTRAINT "publicTagToTag_a_b_pk" PRIMARY KEY("a","b")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publicTags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255),
	"color" varchar(255),
	"isMain" boolean DEFAULT true,
	"pinyin" varchar(255) DEFAULT '' NOT NULL,
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	CONSTRAINT "publicTags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publicBookmarkToTag" ADD CONSTRAINT "publicBookmarkToTag_bId_publicBookmarks_id_fk" FOREIGN KEY ("bId") REFERENCES "public"."publicBookmarks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publicBookmarkToTag" ADD CONSTRAINT "publicBookmarkToTag_tId_publicTags_id_fk" FOREIGN KEY ("tId") REFERENCES "public"."publicTags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publicTagToTag" ADD CONSTRAINT "publicTagToTag_a_publicTags_id_fk" FOREIGN KEY ("a") REFERENCES "public"."publicTags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publicTagToTag" ADD CONSTRAINT "publicTagToTag_b_publicTags_id_fk" FOREIGN KEY ("b") REFERENCES "public"."publicTags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
