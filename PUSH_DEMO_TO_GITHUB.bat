@echo off
title Push ProfitPilot Demo to GitHub
color 0a
echo ========================================================
echo       رفع ديمو ProfitPilot AI إلى GitHub Pages
echo ========================================================
echo.

REM 1. الانتقال لمجلد الديمو
cd /d "C:\Users\mouad\Desktop\AI COD Profit & Returns Analyzer\github_demo"

REM 2. التحقق من وجود مستودع بعيد
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [تنبيه] يرجى أولاً إنشاء مستودع جديد باسم profitpilot-demo على حسابك في GitHub:
    echo https://github.com/new
    echo.
    echo بعد إنشاء المستودع، اضغط Enter للمتابعة...
    pause
    git remote add origin https://github.com/mouadjilbab1/profitpilot-demo.git
)

REM 3. التأكد من حفظ جميع التغييرات
git add .
git commit -m "update: refresh ProfitPilot AI live demo showcase" >nul 2>&1
git branch -M main

REM 4. رفع الكود
echo جاري رفع الملفات إلى GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  تم رفع الديمو إلى GitHub بنجاح!
    echo ========================================================
    echo.
    echo الآن لتفعيل الرابط المباشر (GitHub Pages):
    echo 1. ادخل إلى: https://github.com/mouadjilbab1/profitpilot-demo/settings/pages
    echo 2. في خانة Branch اختر "main" و "/ (root)" ثم اضغط Save.
    echo 3. رابط الديمو المباشر للزبائن سيكون:
    echo    https://mouadjilbab1.github.io/profitpilot-demo/
    echo.
) else (
    echo.
    echo [خطأ] تعذر الرفع تلقائياً. تأكد من تسجيل دخولك في Git أو تفعيل Personal Access Token.
)

pause
