using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeSlotTemplateAndRefactorAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExpertAvailabilitySlots_ExpertId_StartDateTime_EndDateTime",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropColumn(
                name: "EndDateTime",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropColumn(
                name: "StartDateTime",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "ExpertAvailabilitySlots",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "SlotTime",
                table: "ExpertAvailabilitySlots",
                type: "character varying(5)",
                maxLength: 5,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "TimeSlotTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSlotTemplates", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1713));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1715));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1681));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1682));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1683));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1490));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1493));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 17, 24, 19, 380, DateTimeKind.Utc).AddTicks(1494));

            migrationBuilder.InsertData(
                table: "TimeSlotTemplates",
                columns: new[] { "Id", "DurationMinutes", "EndTime", "SortOrder", "StartTime" },
                values: new object[,]
                {
                    { 1, 30, new TimeOnly(0, 30, 0), 1, new TimeOnly(0, 0, 0) },
                    { 2, 30, new TimeOnly(1, 0, 0), 2, new TimeOnly(0, 30, 0) },
                    { 3, 30, new TimeOnly(1, 30, 0), 3, new TimeOnly(1, 0, 0) },
                    { 4, 30, new TimeOnly(2, 0, 0), 4, new TimeOnly(1, 30, 0) },
                    { 5, 30, new TimeOnly(2, 30, 0), 5, new TimeOnly(2, 0, 0) },
                    { 6, 30, new TimeOnly(3, 0, 0), 6, new TimeOnly(2, 30, 0) },
                    { 7, 30, new TimeOnly(3, 30, 0), 7, new TimeOnly(3, 0, 0) },
                    { 8, 30, new TimeOnly(4, 0, 0), 8, new TimeOnly(3, 30, 0) },
                    { 9, 30, new TimeOnly(4, 30, 0), 9, new TimeOnly(4, 0, 0) },
                    { 10, 30, new TimeOnly(5, 0, 0), 10, new TimeOnly(4, 30, 0) },
                    { 11, 30, new TimeOnly(5, 30, 0), 11, new TimeOnly(5, 0, 0) },
                    { 12, 30, new TimeOnly(6, 0, 0), 12, new TimeOnly(5, 30, 0) },
                    { 13, 30, new TimeOnly(6, 30, 0), 13, new TimeOnly(6, 0, 0) },
                    { 14, 30, new TimeOnly(7, 0, 0), 14, new TimeOnly(6, 30, 0) },
                    { 15, 30, new TimeOnly(7, 30, 0), 15, new TimeOnly(7, 0, 0) },
                    { 16, 30, new TimeOnly(8, 0, 0), 16, new TimeOnly(7, 30, 0) },
                    { 17, 30, new TimeOnly(8, 30, 0), 17, new TimeOnly(8, 0, 0) },
                    { 18, 30, new TimeOnly(9, 0, 0), 18, new TimeOnly(8, 30, 0) },
                    { 19, 30, new TimeOnly(9, 30, 0), 19, new TimeOnly(9, 0, 0) },
                    { 20, 30, new TimeOnly(10, 0, 0), 20, new TimeOnly(9, 30, 0) },
                    { 21, 30, new TimeOnly(10, 30, 0), 21, new TimeOnly(10, 0, 0) },
                    { 22, 30, new TimeOnly(11, 0, 0), 22, new TimeOnly(10, 30, 0) },
                    { 23, 30, new TimeOnly(11, 30, 0), 23, new TimeOnly(11, 0, 0) },
                    { 24, 30, new TimeOnly(12, 0, 0), 24, new TimeOnly(11, 30, 0) },
                    { 25, 30, new TimeOnly(12, 30, 0), 25, new TimeOnly(12, 0, 0) },
                    { 26, 30, new TimeOnly(13, 0, 0), 26, new TimeOnly(12, 30, 0) },
                    { 27, 30, new TimeOnly(13, 30, 0), 27, new TimeOnly(13, 0, 0) },
                    { 28, 30, new TimeOnly(14, 0, 0), 28, new TimeOnly(13, 30, 0) },
                    { 29, 30, new TimeOnly(14, 30, 0), 29, new TimeOnly(14, 0, 0) },
                    { 30, 30, new TimeOnly(15, 0, 0), 30, new TimeOnly(14, 30, 0) },
                    { 31, 30, new TimeOnly(15, 30, 0), 31, new TimeOnly(15, 0, 0) },
                    { 32, 30, new TimeOnly(16, 0, 0), 32, new TimeOnly(15, 30, 0) },
                    { 33, 30, new TimeOnly(16, 30, 0), 33, new TimeOnly(16, 0, 0) },
                    { 34, 30, new TimeOnly(17, 0, 0), 34, new TimeOnly(16, 30, 0) },
                    { 35, 30, new TimeOnly(17, 30, 0), 35, new TimeOnly(17, 0, 0) },
                    { 36, 30, new TimeOnly(18, 0, 0), 36, new TimeOnly(17, 30, 0) },
                    { 37, 30, new TimeOnly(18, 30, 0), 37, new TimeOnly(18, 0, 0) },
                    { 38, 30, new TimeOnly(19, 0, 0), 38, new TimeOnly(18, 30, 0) },
                    { 39, 30, new TimeOnly(19, 30, 0), 39, new TimeOnly(19, 0, 0) },
                    { 40, 30, new TimeOnly(20, 0, 0), 40, new TimeOnly(19, 30, 0) },
                    { 41, 30, new TimeOnly(20, 30, 0), 41, new TimeOnly(20, 0, 0) },
                    { 42, 30, new TimeOnly(21, 0, 0), 42, new TimeOnly(20, 30, 0) },
                    { 43, 30, new TimeOnly(21, 30, 0), 43, new TimeOnly(21, 0, 0) },
                    { 44, 30, new TimeOnly(22, 0, 0), 44, new TimeOnly(21, 30, 0) },
                    { 45, 30, new TimeOnly(22, 30, 0), 45, new TimeOnly(22, 0, 0) },
                    { 46, 30, new TimeOnly(23, 0, 0), 46, new TimeOnly(22, 30, 0) },
                    { 47, 30, new TimeOnly(23, 30, 0), 47, new TimeOnly(23, 0, 0) },
                    { 48, 30, new TimeOnly(0, 0, 0), 48, new TimeOnly(23, 30, 0) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExpertAvailabilitySlots_ExpertId_Date_TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots",
                columns: new[] { "ExpertId", "Date", "TimeSlotTemplateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExpertAvailabilitySlots_TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots",
                column: "TimeSlotTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExpertAvailabilitySlots_TimeSlotTemplates_TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots",
                column: "TimeSlotTemplateId",
                principalTable: "TimeSlotTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExpertAvailabilitySlots_TimeSlotTemplates_TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropTable(
                name: "TimeSlotTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ExpertAvailabilitySlots_ExpertId_Date_TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropIndex(
                name: "IX_ExpertAvailabilitySlots_TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropColumn(
                name: "SlotTime",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.DropColumn(
                name: "TimeSlotTemplateId",
                table: "ExpertAvailabilitySlots");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDateTime",
                table: "ExpertAvailabilitySlots",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDateTime",
                table: "ExpertAvailabilitySlots",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6426));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 11, 8, 3, 6, 926, DateTimeKind.Utc).AddTicks(6428));

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

            migrationBuilder.CreateIndex(
                name: "IX_ExpertAvailabilitySlots_ExpertId_StartDateTime_EndDateTime",
                table: "ExpertAvailabilitySlots",
                columns: new[] { "ExpertId", "StartDateTime", "EndDateTime" });
        }
    }
}
