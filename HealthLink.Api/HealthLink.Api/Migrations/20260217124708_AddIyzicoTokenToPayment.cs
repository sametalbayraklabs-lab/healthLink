using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIyzicoTokenToPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IyzicoToken",
                table: "Payments",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(881));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(884));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(839));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(841));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(843));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(682));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(685));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 17, 12, 47, 8, 2, DateTimeKind.Utc).AddTicks(689));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IyzicoToken",
                table: "Payments");

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(611));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(613));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(566));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(567));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(569));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(288));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(294));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 16, 51, 53, 687, DateTimeKind.Utc).AddTicks(295));
        }
    }
}
