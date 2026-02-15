using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonkeyTypeStats.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class MakeResultFieldsNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string[]>(
                name: "Tags",
                table: "Results",
                type: "text[]",
                nullable: true,
                oldClrType: typeof(string[]),
                oldType: "text[]"
            );

            migrationBuilder.AlterColumn<int>(
                name: "RestartCount",
                table: "Results",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AlterColumn<int>(
                name: "QuoteLength",
                table: "Results",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AlterColumn<bool>(
                name: "Punctuation",
                table: "Results",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );

            migrationBuilder.AlterColumn<bool>(
                name: "Numbers",
                table: "Results",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );

            migrationBuilder.AlterColumn<bool>(
                name: "LazyMode",
                table: "Results",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );

            migrationBuilder.AlterColumn<bool>(
                name: "IsPb",
                table: "Results",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );

            migrationBuilder.AlterColumn<double>(
                name: "IncompleteTestSeconds",
                table: "Results",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision"
            );

            migrationBuilder.AlterColumn<string[]>(
                name: "Funbox",
                table: "Results",
                type: "text[]",
                nullable: true,
                oldClrType: typeof(string[]),
                oldType: "text[]"
            );

            migrationBuilder.AlterColumn<bool>(
                name: "BlindMode",
                table: "Results",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );

            migrationBuilder.AlterColumn<bool>(
                name: "BailedOut",
                table: "Results",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean"
            );

            migrationBuilder.AlterColumn<double>(
                name: "AfkDuration",
                table: "Results",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string[]>(
                name: "Tags",
                table: "Results",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0],
                oldClrType: typeof(string[]),
                oldType: "text[]",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "RestartCount",
                table: "Results",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "QuoteLength",
                table: "Results",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<bool>(
                name: "Punctuation",
                table: "Results",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<bool>(
                name: "Numbers",
                table: "Results",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<bool>(
                name: "LazyMode",
                table: "Results",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<bool>(
                name: "IsPb",
                table: "Results",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<double>(
                name: "IncompleteTestSeconds",
                table: "Results",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string[]>(
                name: "Funbox",
                table: "Results",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0],
                oldClrType: typeof(string[]),
                oldType: "text[]",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<bool>(
                name: "BlindMode",
                table: "Results",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<bool>(
                name: "BailedOut",
                table: "Results",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<double>(
                name: "AfkDuration",
                table: "Results",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "double precision",
                oldNullable: true
            );
        }
    }
}
