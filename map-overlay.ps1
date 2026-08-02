Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$assetDir = Join-Path $scriptDir "assets\maps\real"
$script:files = @(
    Get-ChildItem -LiteralPath $assetDir -File -ErrorAction Stop |
        Where-Object { $_.Extension -in ".jpg", ".jpeg", ".png" } |
        Group-Object BaseName |
        ForEach-Object {
            $_.Group |
                Sort-Object @{ Expression = { if ($_.Extension -eq ".png") { 0 } else { 1 } } } |
                Select-Object -First 1
        } |
        Sort-Object Name
)

if ($script:files.Count -eq 0) {
    [System.Windows.Forms.MessageBox]::Show("Map images were not found. Please keep the assets folder next to this file.")
    exit 1
}

if ($args -contains "-test") {
    Write-Output "overlay images: $($script:files.Count)"
    exit 0
}

$script:index = 0

$form = New-Object System.Windows.Forms.Form
$form.Text = "IDV Map Overlay"
$form.ClientSize = New-Object System.Drawing.Size(380, 680)
$form.StartPosition = "Manual"
$form.Location = New-Object System.Drawing.Point(90, 90)
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
$form.TopMost = $true
$form.ShowInTaskbar = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(22, 26, 31)
$form.Opacity = 0.92
$form.KeyPreview = $true

$header = New-Object System.Windows.Forms.Panel
$header.Dock = "Top"
$header.Height = 46
$header.BackColor = [System.Drawing.Color]::FromArgb(29, 35, 42)

$title = New-Object System.Windows.Forms.Label
$title.Text = "IDV Map Overlay"
$title.ForeColor = [System.Drawing.Color]::White
$title.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 10, [System.Drawing.FontStyle]::Bold)
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(12, 14)

function New-IconButton {
    param(
        [string]$Text,
        [int]$Left
    )
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $Text
    $button.Width = 34
    $button.Height = 30
    $button.Left = $Left
    $button.Top = 8
    $button.FlatStyle = "Flat"
    $button.FlatAppearance.BorderSize = 0
    $button.BackColor = [System.Drawing.Color]::FromArgb(29, 35, 42)
    $button.ForeColor = [System.Drawing.Color]::White
    $button.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 12, [System.Drawing.FontStyle]::Bold)
    $button.Cursor = [System.Windows.Forms.Cursors]::Hand
    return $button
}

$prevButton = New-IconButton "<" 260
$nextButton = New-IconButton ">" 298
$closeButton = New-IconButton "X" 336

$header.Controls.Add($title)
$header.Controls.Add($prevButton)
$header.Controls.Add($nextButton)
$header.Controls.Add($closeButton)

$picture = New-Object System.Windows.Forms.PictureBox
$picture.Dock = "Fill"
$picture.SizeMode = [System.Windows.Forms.PictureBoxSizeMode]::Zoom
$picture.BackColor = [System.Drawing.Color]::FromArgb(11, 13, 15)

$bottom = New-Object System.Windows.Forms.Panel
$bottom.Dock = "Bottom"
$bottom.Height = 56
$bottom.BackColor = [System.Drawing.Color]::FromArgb(22, 26, 31)

$counter = New-Object System.Windows.Forms.Label
$counter.Text = "Map 1 / $($script:files.Count)"
$counter.ForeColor = [System.Drawing.Color]::FromArgb(170, 179, 189)
$counter.Font = New-Object System.Drawing.Font("Microsoft YaHei UI", 9)
$counter.AutoSize = $true
$counter.Location = New-Object System.Drawing.Point(12, 20)

$opacity = New-Object System.Windows.Forms.TrackBar
$opacity.Minimum = 35
$opacity.Maximum = 100
$opacity.Value = 90
$opacity.TickStyle = "None"
$opacity.Width = 230
$opacity.Height = 40
$opacity.Location = New-Object System.Drawing.Point(130, 6)
$opacity.BackColor = [System.Drawing.Color]::FromArgb(22, 26, 31)
$opacity.ForeColor = [System.Drawing.Color]::FromArgb(226, 163, 76)

$bottom.Controls.Add($counter)
$bottom.Controls.Add($opacity)

$form.Controls.Add($picture)
$form.Controls.Add($header)
$form.Controls.Add($bottom)

function Update-Map {
    $file = $script:files[$script:index]
    $temp = [System.Drawing.Image]::FromFile($file.FullName)
    $picture.Image = $temp.Clone()
    $temp.Dispose()
    $counter.Text = "Map $($script:index + 1) / $($script:files.Count)"
    $form.Text = "IDV Map Overlay - Map $($script:index + 1)"
}

$script:dragging = $false
$script:dragOffset = New-Object System.Drawing.Point(0, 0)

$dragDown = {
    param($sender, $eventArgs)
    if ($eventArgs.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        $script:dragging = $true
        $script:dragOffset = $eventArgs.Location
    }
}

$dragMove = {
    param($sender, $eventArgs)
    if ($script:dragging) {
        $form.Location = New-Object System.Drawing.Point(
            ($form.Left + $eventArgs.X - $script:dragOffset.X),
            ($form.Top + $eventArgs.Y - $script:dragOffset.Y)
        )
    }
}

$dragUp = {
    param($sender, $eventArgs)
    $script:dragging = $false
}

$form.add_MouseDown($dragDown)
$form.add_MouseMove($dragMove)
$form.add_MouseUp($dragUp)
$header.add_MouseDown($dragDown)
$header.add_MouseMove($dragMove)
$header.add_MouseUp($dragUp)
$title.add_MouseDown($dragDown)
$title.add_MouseMove($dragMove)
$title.add_MouseUp($dragUp)

$prevButton.Add_Click({
    $script:index = ($script:index - 1 + $script:files.Count) % $script:files.Count
    Update-Map
})

$nextButton.Add_Click({
    $script:index = ($script:index + 1) % $script:files.Count
    Update-Map
})

$closeButton.Add_Click({
    $form.Close()
})

$opacity.Add_ValueChanged({
    $form.Opacity = $opacity.Value / 100
})

$form.Add_KeyDown({
    if ($_.KeyCode -eq "Left") {
        $script:index = ($script:index - 1 + $script:files.Count) % $script:files.Count
        Update-Map
    }
    elseif ($_.KeyCode -eq "Right") {
        $script:index = ($script:index + 1) % $script:files.Count
        Update-Map
    }
    elseif ($_.KeyCode -eq "Escape") {
        $form.Close()
    }
})

$form.Add_Shown({
    Update-Map
})

[System.Windows.Forms.Application]::Run($form)
