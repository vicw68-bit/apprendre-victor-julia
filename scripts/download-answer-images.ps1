# Images des reponses — sources Wikipedia / Deezer / Unsplash (libres d'usage)
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\images\answers"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

function Save-Url($url, $name, [int]$delaySec = 1) {
  $out = Join-Path $dir $name
  Start-Sleep -Seconds $delaySec
  & curl.exe -sL -A "VictorQuiz/1.0" -o $out $url
  if (-not (Test-Path $out)) { throw "Missing file: $name" }
  $len = (Get-Item $out).Length
  if ($len -lt 2500) { throw "Download too small: $name ($len bytes) from $url" }
  Write-Host "OK $name ($len bytes)"
}

function Save-Color($hex, $name) {
  Add-Type -AssemblyName System.Drawing
  $out = Join-Path $dir $name
  $bmp = New-Object System.Drawing.Bitmap 520, 360
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  $g.Clear($color)
  $g.Dispose()
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $bmp.Dispose()
  Write-Host "OK $name (color $hex)"
}

$urls = [ordered]@{
  "musique-jul.jpg" = "https://cdn-images.dzcdn.net/images/artist/16eb681d72934d4db17088dfc216669d/500x500-000000-80-0-0.jpg"
  "musique-sch.jpg" = "https://cdn-images.dzcdn.net/images/artist/8d9c407bd25fab0fc961b6abf335e874/500x500-000000-80-0-0.jpg"
  "musique-plk.jpg" = "https://cdn-images.dzcdn.net/images/artist/f57f9dca944e55afdd99802491c49823/500x500-000000-80-0-0.jpg"
  "musique-timal.jpg" = "https://cdn-images.dzcdn.net/images/artist/49a230282599d7354c95a5be736c906c/500x500-000000-80-0-0.jpg"

  "plat-pizza.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/960px-Pizza-3007395.jpg"
  "plat-sushi.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/960px-Sushi_platter.jpg"
  "plat-tacos.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg/960px-001_Tacos_de_carnitas%2C_carne_asada_y_al_pastor.jpg"
  "plat-raclette.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Raclette_20040817_140816.jpg/960px-Raclette_20040817_140816.jpg"

  "sport-foot.jpg" = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Stoppage_in_an_AFL_game.jpg/960px-Stoppage_in_an_AFL_game.jpg"
  "sport-basket.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/USA_vs._China_Mens_Basketball_-_Beijing_2008_Olympic_Games_%282751923597%29.jpg/960px-USA_vs._China_Mens_Basketball_-_Beijing_2008_Olympic_Games_%282751923597%29.jpg"
  "sport-ski.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Skiing_The_Flying_Kilometre_c1919.jpg/960px-Skiing_The_Flying_Kilometre_c1919.jpg"
  "sport-escalade.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Crack_climbing_in_Indian_Creek%2C_Utah.jpg/960px-Crack_climbing_in_Indian_Creek%2C_Utah.jpg"

  "saison-printemps.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/A_close-up_photo_of_a_cherry_blossom_flower.jpg/960px-A_close-up_photo_of_a_cherry_blossom_flower.jpg"
  "saison-ete.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Sunny_sky_over_Bali%2C_Indonesia.jpg/960px-Sunny_sky_over_Bali%2C_Indonesia.jpg"
  "saison-automne.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Autumn_leaves_in_October.jpg/960px-Autumn_leaves_in_October.jpg"
  "saison-hiver.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Snowy_scene_in_Quebec.jpg/960px-Snowy_scene_in_Quebec.jpg"

  "boisson-monster.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Monster_Energy_drink_can.jpg/960px-Monster_Energy_drink_can.jpg"
  "boisson-oasis.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Orangina.jpg/960px-Orangina.jpg"
  "boisson-coca.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Coca-Cola_can.jpg/960px-Coca-Cola_can.jpg"
  "boisson-rootbeer.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Mug_of_root_beer.jpg/960px-Mug_of_root_beer.jpg"

  "phobie-vertige.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Cliff_above_Blue_Hole%2C_Dwejra%2C_Gozo%2C_Malta.jpg/960px-Cliff_above_Blue_Hole%2C_Dwejra%2C_Gozo%2C_Malta.jpg"
  "phobie-eau.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Deep_sea_creature.jpg/960px-Deep_sea_creature.jpg"
  "phobie-araignee.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Brachypelma_auratum_female.jpg/960px-Brachypelma_auratum_female.jpg"
  "phobie-serpent.jpg" = "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Green_Tree_Python_%28Morelia_viridis%29.jpg/960px-Green_Tree_Python_%28Morelia_viridis%29.jpg"
}

$wikiPosters = [ordered]@{
  "cinema-avatar.jpg" = "https://upload.wikimedia.org/wikipedia/en/d/d6/Avatar_%282009_film%29_poster.jpg"
  "cinema-loup.jpg" = "https://upload.wikimedia.org/wikipedia/en/3/3e/The_Wolf_of_Wall_Street_2013_poster.jpg"
  "cinema-projectx.jpg" = "https://upload.wikimedia.org/wikipedia/en/7/7f/Project_X_Poster.jpg"
  "cinema-interstellar.jpg" = "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg"
}

foreach ($kv in $urls.GetEnumerator()) {
  if ($wikiPosters.Contains($kv.Key)) { continue }
  Save-Url $kv.Value $kv.Key 2
}

foreach ($kv in $wikiPosters.GetEnumerator()) {
  Save-Url $kv.Value $kv.Key 6
}

Save-Color "#2563eb" "couleur-bleu.jpg"
Save-Color "#dc2626" "couleur-rouge.jpg"
Save-Color "#16a34a" "couleur-vert.jpg"
Save-Color "#171717" "couleur-noir.jpg"

Write-Host "Done - 32 images in $dir"
