@echo off
chcp 65001 >nul
echo ========================================
echo   乡村助学平台 - AI智能匹配功能
echo   快速启动指南
echo ========================================
echo.

echo [1/4] 检查后端服务...
echo.
echo 提示: 请确保已启动后端服务器 (端口 3000)
echo 如果没有启动，请在新终端运行:
echo   cd teacher_system\xiangcun\hou
echo   node app.js
echo.
pause

echo.
echo [2/4] 启动学生端前端...
echo.
echo 请在新终端运行:
echo   cd student_stystem\vallege_student_help_qian
echo   npm run dev
echo.
pause

echo.
echo [3/4] 启动教师端前端...
echo.
echo 请在新终端运行:
echo   cd teacher_system\xiangcun\qian
echo   npm run dev
echo.
pause

echo.
echo [4/4] 启动家长端和管理员端（可选）...
echo.
echo 家长端:
echo   cd Parent_system\parent_qianduan
echo   npm run dev
echo.
echo 管理员端:
echo   cd manager_system\manager_system\qian_duan\vue-project
echo   npm run dev
echo.
pause

echo.
echo ========================================
echo   所有服务启动说明已完成！
echo ========================================
echo.
echo 访问地址:
echo   - 学生端: http://localhost:5173 (或Vite分配的其他端口)
echo   - 教师端: http://localhost:5174 (或Vite分配的其他端口)
echo   - 后端API: http://localhost:3000
echo.
echo 测试账号:
echo   - 学生: student1 / student123
echo   - 教师: teacher1 / teacher123
echo   - 家长: parent1 / parent123
echo   - 管理员: admin / admin123
echo.
echo 详细说明请查看: AI匹配功能迁移说明.md
echo.
pause
