using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class SupportRequest_AddOperatorUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "OperatorUserId",
                table: "SupportRequests",
                type: "bigint",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4712));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4715));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4671));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4673));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4675));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4446));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4451));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 6, 34, 52, 839, DateTimeKind.Utc).AddTicks(4453));

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_OperatorUserId",
                table: "SupportRequests",
                column: "OperatorUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportRequests_Users_OperatorUserId",
                table: "SupportRequests",
                column: "OperatorUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupportRequests_Users_OperatorUserId",
                table: "SupportRequests");

            migrationBuilder.DropIndex(
                name: "IX_SupportRequests_OperatorUserId",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "OperatorUserId",
                table: "SupportRequests");

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(8128));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(8130));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(8103));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(8104));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(8105));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(7890));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(7893));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 20, 53, 39, 471, DateTimeKind.Utc).AddTicks(7894));
        }
    }
}
