using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonkeyTypeStats.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CreateResultDetailsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResultDetails",
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
                    QuoteLength = table.Column<int>(type: "integer", nullable: true),
                    Timestamp = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
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
                    RestartCount = table.Column<int>(type: "integer", nullable: true),
                    IncompleteTestSeconds = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    AfkDuration = table.Column<double>(type: "double precision", nullable: true),
                    Tags = table.Column<string[]>(type: "text[]", nullable: true),
                    BailedOut = table.Column<bool>(type: "boolean", nullable: true),
                    BlindMode = table.Column<bool>(type: "boolean", nullable: true),
                    LazyMode = table.Column<bool>(type: "boolean", nullable: true),
                    Funbox = table.Column<string[]>(type: "text[]", nullable: true),
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
                    Numbers = table.Column<bool>(type: "boolean", nullable: true),
                    Punctuation = table.Column<bool>(type: "boolean", nullable: true),
                    IsPb = table.Column<bool>(type: "boolean", nullable: true),
                    ChartWpm = table.Column<double[]>(type: "double precision[]", nullable: true),
                    ChartBurst = table.Column<double[]>(type: "double precision[]", nullable: true),
                    ChartErr = table.Column<double[]>(type: "double precision[]", nullable: true),
                    KeySpacingAverage = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    KeySpacingSd = table.Column<double>(type: "double precision", nullable: true),
                    KeyDurationAverage = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    KeyDurationSd = table.Column<double>(type: "double precision", nullable: true),
                    Name = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultDetails", x => x.Id);
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ResultDetails");
        }
    }
}
