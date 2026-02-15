using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonkeyTypeStats.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreateResultsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Results",
                columns: table => new
                {
                    Id = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Wpm = table.Column<double>(type: "double precision", nullable: false),
                    RawWpm = table.Column<double>(type: "double precision", nullable: false),
                    CharStats = table.Column<int[]>(type: "integer[]", nullable: false),
                    Acc = table.Column<double>(type: "double precision", nullable: false),
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
                    QuoteLength = table.Column<int>(type: "integer", nullable: false),
                    Timestamp = table.Column<long>(type: "bigint", nullable: false),
                    TestDuration = table.Column<double>(type: "double precision", nullable: false),
                    Consistency = table.Column<double>(type: "double precision", nullable: false),
                    KeyConsistency = table.Column<double>(
                        type: "double precision",
                        nullable: false
                    ),
                    Uid = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: false
                    ),
                    RestartCount = table.Column<int>(type: "integer", nullable: false),
                    IncompleteTestSeconds = table.Column<double>(
                        type: "double precision",
                        nullable: false
                    ),
                    AfkDuration = table.Column<double>(type: "double precision", nullable: false),
                    Tags = table.Column<string[]>(type: "text[]", nullable: false),
                    BailedOut = table.Column<bool>(type: "boolean", nullable: false),
                    BlindMode = table.Column<bool>(type: "boolean", nullable: false),
                    LazyMode = table.Column<bool>(type: "boolean", nullable: false),
                    Funbox = table.Column<string[]>(type: "text[]", nullable: false),
                    Language = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Difficulty = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false
                    ),
                    Numbers = table.Column<bool>(type: "boolean", nullable: false),
                    Punctuation = table.Column<bool>(type: "boolean", nullable: false),
                    IsPb = table.Column<bool>(type: "boolean", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Results", x => x.Id);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Results");
        }
    }
}
