@props(['url'])
@php
    $targetUrl = $url ?? rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');
@endphp
<tr>
<td class="header" align="center" style="text-align: center; padding: 32px 0 20px 0;">
<a href="{{ $targetUrl }}" style="display: inline-block; text-decoration: none; font-family: 'Century Gothic', CenturyGothic, AppleGothic, 'ITC Century Gothic', Futura, 'Tw Cen MT', sans-serif;">
    <span style="font-size: 34px; letter-spacing: -0.5px; line-height: 1; font-family: 'Century Gothic', CenturyGothic, AppleGothic, 'ITC Century Gothic', Futura, 'Tw Cen MT', sans-serif;">
        <span class="brand-luta" style="color: #000000; font-weight: 700; font-family: 'Century Gothic', CenturyGothic, AppleGothic, 'ITC Century Gothic', Futura, 'Tw Cen MT', sans-serif;">Luta</span><span class="brand-tech" style="color: #dc2626; font-weight: 400; font-family: 'Century Gothic', CenturyGothic, AppleGothic, 'ITC Century Gothic', Futura, 'Tw Cen MT', sans-serif;">Tech</span>
    </span>
</a>
</td>
</tr>
