# Fix MUI Grid v2 props across all affected files
# Old: <Grid item xs={12} md={6}> → New: <Grid size={{ xs: 12, md: 6 }}>
# Old: <Grid item xs={12}> → New: <Grid size={12}>

$files = @(
    "app/admin/appointments/page.tsx",
    "app/admin/content/page.tsx",
    "app/admin/dashboard/page.tsx",
    "app/admin/reviews/page.tsx",
    "app/client/packages/[id]/page.tsx",
    "app/expert/calendar/components/RecurringScheduleSettings.tsx",
    "app/expert/dashboard/page.tsx",
    "components/admin/DiscountCodeFormDialog.tsx"
)

foreach ($file in $files) {
    $path = "C:\Workspaces\Healthlink\healthLink\healthlink-frontend\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Replace: item xs={N} sm={N} md={N} → size={{ xs: N, sm: N, md: N }}
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}>', '<Grid size={{ xs: $1, sm: $2, md: $3 }}>'
        
        # Replace: item xs={N} md={N} → size={{ xs: N, md: N }}
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}>', '<Grid size={{ xs: $1, md: $2 }}>'
        
        # Replace: item xs={N} sm={N} → size={{ xs: N, sm: N }}
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}>', '<Grid size={{ xs: $1, sm: $2 }}>'
        
        # Replace: item xs={N} (only xs) → size={N}
        $content = $content -replace '<Grid\s+item\s+xs=\{(\d+)\}>', '<Grid size={$1}>'

        # Handle key before item: <Grid key={...} xs={N} sm={N} md={N}>
        $content = $content -replace '<Grid\s+key=\{([^}]+)\}\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}>', '<Grid key={$1} size={{ xs: $2, sm: $3, md: $4 }}>'
        
        # Grid2 import is already 'Grid' from @mui/material in v7
        
        Set-Content $path -Value $content -NoNewline
        Write-Host "Fixed: $file"
    } else {
        Write-Host "Not found: $file"
    }
}

Write-Host "Done!"
