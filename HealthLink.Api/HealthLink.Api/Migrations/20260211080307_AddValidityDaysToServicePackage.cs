using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddValidityDaysToServicePackage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ValidityDays",
                table: "ServicePackages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                columns: new[] { "CreatedAt", "ValidityDays" },
                values: new object[] { new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6426), 30 });

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                columns: new[] { "CreatedAt", "ValidityDays" },
                values: new object[] { new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6428), 90 });

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6400));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6401));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6402));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6212));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6214));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6215));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidityDays",
                table: "ServicePackages");

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5872));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5874));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5847));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5848));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5849));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5640));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5643));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 9, 21, 7, 1, 960, DateTimeKind.Utc).AddTicks(5644));
        }
    }
}
