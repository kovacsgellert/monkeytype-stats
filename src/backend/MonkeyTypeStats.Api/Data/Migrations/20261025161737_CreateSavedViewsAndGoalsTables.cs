using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonkeyTypeStats.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreateSavedViewsAndGoalsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Goals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Title = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    Filter = table.Column<string>(type: "jsonb", nullable: true),
                    Target = table.Column<double>(type: "double precision", nullable: false),
                    WindowSize = table.Column<int>(type: "integer", nullable: true),
                    Deadline = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    StartedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    AchievedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    ArchivedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Goals", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "SavedViews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    Filter = table.Column<string>(type: "jsonb", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedViews", x => x.Id);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Goals");

            migrationBuilder.DropTable(name: "SavedViews");
        }
    }
}
