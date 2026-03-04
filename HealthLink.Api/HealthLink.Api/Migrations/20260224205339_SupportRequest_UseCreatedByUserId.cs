using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class SupportRequest_UseCreatedByUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupportRequests_Clients_ClientId",
                table: "SupportRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportRequests_Conversations_ConversationId",
                table: "SupportRequests");

            migrationBuilder.DropIndex(
                name: "IX_SupportRequests_ConversationId",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "SupportRequests");

            migrationBuilder.RenameColumn(
                name: "ClientId",
                table: "SupportRequests",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_SupportRequests_ClientId",
                table: "SupportRequests",
                newName: "IX_SupportRequests_CreatedByUserId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_SupportRequests_Users_CreatedByUserId",
                table: "SupportRequests",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupportRequests_Users_CreatedByUserId",
                table: "SupportRequests");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "SupportRequests",
                newName: "ClientId");

            migrationBuilder.RenameIndex(
                name: "IX_SupportRequests_CreatedByUserId",
                table: "SupportRequests",
                newName: "IX_SupportRequests_ClientId");

            migrationBuilder.AddColumn<long>(
                name: "ConversationId",
                table: "SupportRequests",
                type: "bigint",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(6041));

            migrationBuilder.UpdateData(
                table: "ServicePackages",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(6044));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(6017));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(6019));

            migrationBuilder.UpdateData(
                table: "Specializations",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(6020));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 1L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(5846));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 2L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(5850));

            migrationBuilder.UpdateData(
                table: "SystemSettings",
                keyColumn: "Id",
                keyValue: 3L,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 18, 7, 54, 152, DateTimeKind.Utc).AddTicks(5851));

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_ConversationId",
                table: "SupportRequests",
                column: "ConversationId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportRequests_Clients_ClientId",
                table: "SupportRequests",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupportRequests_Conversations_ConversationId",
                table: "SupportRequests",
                column: "ConversationId",
                principalTable: "Conversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
