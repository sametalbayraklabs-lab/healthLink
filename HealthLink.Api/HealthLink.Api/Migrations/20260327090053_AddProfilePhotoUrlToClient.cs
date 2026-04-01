using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePhotoUrlToClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePhotoUrl",
                table: "Clients",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2589));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2591));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2461));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2463));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2554));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2313));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2316));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 27, 9, 0, 53, 505, DateTimeKind.Utc).AddTicks(2317));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePhotoUrl",
                table: "Clients");

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4710));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4712));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4602));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4604));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4605));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4307));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4312));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 2, 10, 52, 55, 278, DateTimeKind.Utc).AddTicks(4313));
        }
    }
}
