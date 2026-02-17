using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileDescriptionToExpert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileDescription",
                table: "Experts",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5694));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5696));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5637));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5638));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5640));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5427));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 13, 11, 25, 42, 766, DateTimeKind.Utc).AddTicks(5431));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileDescription",
                table: "Experts");

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4687));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4689));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4654));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4656));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4657));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4416));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4449));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 12, 21, 37, 17, 737, DateTimeKind.Utc).AddTicks(4451));
        }
    }
}
