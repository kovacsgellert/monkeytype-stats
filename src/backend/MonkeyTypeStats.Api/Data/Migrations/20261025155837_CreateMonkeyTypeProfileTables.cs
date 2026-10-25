using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonkeyTypeStats.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreateMonkeyTypeProfileTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LeaderboardSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CapturedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    Language = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Mode = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Mode2 = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Rank = table.Column<int>(type: "integer", nullable: true),
                    FriendsRank = table.Column<int>(type: "integer", nullable: true),
                    LeaderboardSize = table.Column<int>(type: "integer", nullable: true),
                    Wpm = table.Column<double>(type: "double precision", nullable: true),
                    Raw = table.Column<double>(type: "double precision", nullable: true),
                    Acc = table.Column<double>(type: "double precision", nullable: true),
                    Consistency = table.Column<double>(type: "double precision", nullable: true),
                    EntryTimestamp = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaderboardSnapshots", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "PersonalBests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Mode = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Mode2 = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Language = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: true
                    ),
                    Difficulty = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: true
                    ),
                    Punctuation = table.Column<bool>(type: "boolean", nullable: true),
                    Numbers = table.Column<bool>(type: "boolean", nullable: true),
                    LazyMode = table.Column<bool>(type: "boolean", nullable: true),
                    Wpm = table.Column<double>(type: "double precision", nullable: false),
                    Raw = table.Column<double>(type: "double precision", nullable: true),
                    Acc = table.Column<double>(type: "double precision", nullable: true),
                    Consistency = table.Column<double>(type: "double precision", nullable: true),
                    Timestamp = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ImportedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalBests", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "ProfileSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CapturedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CompletedTests = table.Column<int>(type: "integer", nullable: false),
                    StartedTests = table.Column<int>(type: "integer", nullable: false),
                    TimeTypingSeconds = table.Column<double>(
                        type: "double precision",
                        nullable: false
                    ),
                    StreakLength = table.Column<int>(type: "integer", nullable: false),
                    MaxStreakLength = table.Column<int>(type: "integer", nullable: false),
                    LastResultTimestamp = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    StreakHourOffset = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileSnapshots", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "SpeedHistogramSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CapturedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    Language = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Mode = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Mode2 = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Buckets = table.Column<string>(type: "jsonb", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeedHistogramSnapshots", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Name = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_LeaderboardSnapshots_Language_Mode_Mode2_CapturedAt",
                table: "LeaderboardSnapshots",
                columns: new[] { "Language", "Mode", "Mode2", "CapturedAt" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_ProfileSnapshots_CapturedAt",
                table: "ProfileSnapshots",
                column: "CapturedAt"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SpeedHistogramSnapshots_Language_Mode_Mode2_CapturedAt",
                table: "SpeedHistogramSnapshots",
                columns: new[] { "Language", "Mode", "Mode2", "CapturedAt" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "LeaderboardSnapshots");

            migrationBuilder.DropTable(name: "PersonalBests");

            migrationBuilder.DropTable(name: "ProfileSnapshots");

            migrationBuilder.DropTable(name: "SpeedHistogramSnapshots");

            migrationBuilder.DropTable(name: "Tags");
        }
    }
}
