using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEducationCertificatesToExpert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Certificates",
                table: "Experts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Education",
                table: "Experts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Certificates",
                table: "Experts");

            migrationBuilder.DropColumn(
                name: "Education",
                table: "Experts");
        }
    }
}
