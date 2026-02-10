using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceIsAvailableWithStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkEndTime",
                table: "ExpertScheduleTemplates");

            migrationBuilder.DropColumn(
                name: "WorkStartTime",
                table: "ExpertScheduleTemplates");

            migrationBuilder.AddColumn<bool>(
                name: "AutoMarkAvailable",
                table: "ExpertScheduleTemplates",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "ExpertAvailabilitySlots",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExpertId = table.Column<long>(type: "bigint", nullable: false),
                    StartDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpertAvailabilitySlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpertAvailabilitySlots_Experts_ExpertId",
                        column: x => x.ExpertId,
                        principalTable: "Experts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExpertScheduleTimeSlots",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TemplateId = table.Column<long>(type: "bigint", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpertScheduleTimeSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExpertScheduleTimeSlots_ExpertScheduleTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "ExpertScheduleTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_ExpertAvailabilitySlots_ExpertId_StartDateTime_EndDateTime",
                table: "ExpertAvailabilitySlots",
                columns: new[] { "ExpertId", "StartDateTime", "EndDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ExpertScheduleTimeSlots_TemplateId",
                table: "ExpertScheduleTimeSlots",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExpertAvailabilitySlots");

            migrationBuilder.DropTable(
                name: "ExpertScheduleTimeSlots");

            migrationBuilder.DropColumn(
                name: "AutoMarkAvailable",
                table: "ExpertScheduleTemplates");

            migrationBuilder.AddColumn<TimeOnly>(
                name: "WorkEndTime",
                table: "ExpertScheduleTemplates",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "WorkStartTime",
                table: "ExpertScheduleTemplates",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7866));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7869));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7838));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7840));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7841));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7665));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7668));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 4, 13, 39, 52, 525, DateTimeKind.Utc).AddTicks(7669));
        }
    }
}
