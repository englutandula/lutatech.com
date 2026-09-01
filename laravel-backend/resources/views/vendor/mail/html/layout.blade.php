<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
<title>{{ config('app.name', 'LutaTech') }}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<style>
:root {
    color-scheme: light dark;
    supported-color-schemes: light dark;
}

body, table, td, p, a, h1, h2, h3, span {
    font-family: 'Century Gothic', CenturyGothic, AppleGothic, 'ITC Century Gothic', Futura, 'Tw Cen MT', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.brand-luta {
    color: #000000 !important;
    font-weight: 700 !important;
}

.brand-tech {
    color: #dc2626 !important;
    font-weight: 400 !important;
}

@media only screen and (max-width: 600px) {
    .inner-body {
        width: 100% !important;
    }
    .footer {
        width: 100% !important;
    }
}

@media only screen and (max-width: 500px) {
    .button {
        width: 100% !important;
    }
}

/* Dark mode overrides for Apple Mail, iOS, Gmail app, Outlook */
@media (prefers-color-scheme: dark) {
    body, .wrapper, .body {
        background-color: #0f172a !important;
    }
    .inner-body {
        background-color: #1e293b !important;
        border-color: #334155 !important;
    }
    .content-cell, p, ul, ol, blockquote {
        color: #f1f5f9 !important;
    }
    h1, h2, h3 {
        color: #ffffff !important;
    }
    .brand-luta {
        color: #ffffff !important;
    }
    .brand-tech {
        color: #ef4444 !important;
    }
    .footer p {
        color: #94a3b8 !important;
    }
}

/* Outlook Android / Web dark mode targets */
[data-ogsc] .brand-luta {
    color: #ffffff !important;
}
[data-ogsc] .brand-tech {
    color: #ef4444 !important;
}
[data-ogsc] .inner-body {
    background-color: #1e293b !important;
}
</style>
{!! $head ?? '' !!}
</head>
<body>

<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td align="center">
<table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
{!! $header ?? '' !!}

<!-- Email Body -->
<tr>
<td class="body" width="100%" cellpadding="0" cellspacing="0" style="border: hidden !important;">
<table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<!-- Body content -->
<tr>
<td class="content-cell">
{!! Illuminate\Mail\Markdown::parse($slot) !!}

{!! $subcopy ?? '' !!}
</td>
</tr>
</table>
</td>
</tr>

{!! $footer ?? '' !!}
</table>
</td>
</tr>
</table>
</body>
</html>
