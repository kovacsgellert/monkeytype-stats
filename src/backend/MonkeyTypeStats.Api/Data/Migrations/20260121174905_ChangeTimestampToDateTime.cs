using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonkeyTypeStats.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangeTimestampToDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Convert bigint (Unix timestamp in milliseconds) to timestamp with time zone
            migrationBuilder.Sql(
                """
                ALTER TABLE "Results"
                ALTER COLUMN "Timestamp" TYPE timestamp with time zone
                USING to_timestamp("Timestamp" / 1000.0) AT TIME ZONE 'UTC';
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Convert timestamp back to bigint (Unix timestamp in milliseconds)
            migrationBuilder.Sql(
                """
                ALTER TABLE "Results"
                ALTER COLUMN "Timestamp" TYPE bigint
                USING (EXTRACT(EPOCH FROM "Timestamp") * 1000)::bigint;
                """
            );
        }
    }
}
