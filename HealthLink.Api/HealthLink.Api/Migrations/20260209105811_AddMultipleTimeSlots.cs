using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleTimeSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create new ExpertScheduleTimeSlots table
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

            migrationBuilder.CreateIndex(
                name: "IX_ExpertScheduleTimeSlots_TemplateId",
                table: "ExpertScheduleTimeSlots",
                column: "TemplateId");

            // 2. Add AutoMarkAvailable column with default value
            migrationBuilder.AddColumn<bool>(
                name: "AutoMarkAvailable",
                table: "ExpertScheduleTemplates",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            // 3. Migrate existing data: Copy WorkStartTime/WorkEndTime to new table
            migrationBuilder.Sql(@"
                INSERT INTO ""ExpertScheduleTimeSlots"" (""TemplateId"", ""StartTime"", ""EndTime"", ""CreatedAt"")
                SELECT ""Id"", ""WorkStartTime"", ""WorkEndTime"", NOW()
                FROM ""ExpertScheduleTemplates""
                WHERE ""WorkStartTime"" IS NOT NULL AND ""WorkEndTime"" IS NOT NULL;
            ");

            // 4. Drop old columns
            migrationBuilder.DropColumn(
                name: "WorkStartTime",
                table: "ExpertScheduleTemplates");

            migrationBuilder.DropColumn(
                name: "WorkEndTime",
                table: "ExpertScheduleTemplates");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse migration: Add back old columns
            migrationBuilder.AddColumn<TimeOnly>(
                name: "WorkStartTime",
                table: "ExpertScheduleTemplates",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "WorkEndTime",
                table: "ExpertScheduleTemplates",
                type: "time without time zone",
                nullable: true);

            // Copy first time slot back to template (if exists)
            migrationBuilder.Sql(@"
                UPDATE ""ExpertScheduleTemplates"" t
                SET ""WorkStartTime"" = ts.""StartTime"",
                    ""WorkEndTime"" = ts.""EndTime""
                FROM (
                    SELECT DISTINCT ON (""TemplateId"") ""TemplateId"", ""StartTime"", ""EndTime""
                    FROM ""ExpertScheduleTimeSlots""
                    ORDER BY ""TemplateId"", ""Id""
                ) ts
                WHERE t.""Id"" = ts.""TemplateId"";
            ");

            // Drop AutoMarkAvailable column
            migrationBuilder.DropColumn(
                name: "AutoMarkAvailable",
                table: "ExpertScheduleTemplates");

            // Drop ExpertScheduleTimeSlots table
            migrationBuilder.DropTable(
                name: "ExpertScheduleTimeSlots");
        }
    }
}
