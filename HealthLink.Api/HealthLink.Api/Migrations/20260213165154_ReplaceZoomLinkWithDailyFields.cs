using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceZoomLinkWithDailyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ZoomLink",
                table: "Appointments",
                newName: "RecordingUrl");

            migrationBuilder.AddColumn<string>(
                name: "DailyRoomName",
                table: "Appointments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeetingUrl",
                table: "Appointments",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecordingStatus",
                table: "Appointments",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyRoomName",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "MeetingUrl",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "RecordingStatus",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "RecordingUrl",
                table: "Appointments",
                newName: "ZoomLink");

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
    }
}
