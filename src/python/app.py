
# The Python Standard Library libs
import os
import struct
import hmac
import subprocess
import winreg
import time
import base64
import json
import sys
from hashlib import sha1
# External libs
import requests
from pywinauto.application import Application
from pywinauto import Desktop
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    app,
    key_func=get_remote_address,
)
app_config = {"host": "0.0.0.0", "port": sys.argv[1]}


"""
---------------------- DEVELOPER MODE CONFIG -----------------------
"""
# Developer mode uses app.py
if "app.py" in sys.argv[0]:

    # Update app config
    app_config["debug"] = True

    # CORS settings
    cors = CORS(
        app,
        resources={r"/*": {"origins": "http://localhost*"}},
    )

    # CORS headers
    app.config["CORS_HEADERS"] = "Content-Type"


"""
--------------------------- REST CALLS -----------------------------
"""
# Steam


@app.route("/steam", methods=['POST'])
@limiter.limit("1 per minute")
def steam():
    data = request.get_json()
    login = data.get('login')
    password = data.get('password')
    shared_secret = data.get('sharedSecret')
    steam_path = find_steam_location()
    os.system('taskkill /f /im Steam.exe')
    proc = subprocess.Popen("{}/steam.exe -login {} {}".format(
        steam_path,
        batch_sanitized(login),
        batch_sanitized(password)
    ))
    pid = proc.pid
    app = Application().connect(process=pid)
    SteamGuardWindow = app.window(title_re='Steam Guard')
    SteamWindow = app.window(title_re='Steam')
    try:
        SteamGuardWindow.wait('ready', timeout=20)
    except:
        try:
            SteamWindow.wait('ready', timeout=10)
            SteamGuardWindow.wait('ready', timeout=60)
        except:
            os.system('taskkill /f /im Steam.exe')
            return jsonify("Error Steam Guard not found"), 403
    try:
        SteamGuardWindow.set_focus()
        SteamGuardWindow.type_keys(generate_auth_code(shared_secret))
        time.sleep(1)
        SteamGuardWindow.type_keys("{ENTER}")
        time.sleep(5)
    except:
        os.system('taskkill /f /im Steam.exe')
        return jsonify("Error Steam Guard not found"), 403
    try:
        SteamGuardWindow.wait_not("exists", timeout=10)
        SteamWindow.wait("exists", timeout=10)
    except:
        os.system('taskkill /f /im Steam.exe')
        return jsonify("Error Steam Client not launched because of login error"), 403
    return jsonify("Success")


def find_steam_location():
    try:
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Software\Valve\Steam")
        return winreg.QueryValueEx(key, "SteamPath")[0]
    except FileNotFoundError as e:
        return None


def batch_sanitized(string):
    characters = {'^': '^', '&': '^', '<': '^', '>': '^', '|': '^', '"': '\\'}
    string = list(string)
    for i in range(len(string)):
        if string[i] in characters:
            string[i] = '{}{}'.format(characters[string[i]], string[i])
    return ''.join(string)


def generate_auth_code(shared_secret: str, timestamp: int = None) -> str:
    if timestamp is None:
        timestamp = int(time.time())
    # pack as Big endian, uint64
    time_buffer = struct.pack('>Q', timestamp // 30)
    time_hmac = hmac.new(base64.b64decode(shared_secret),
                         time_buffer, digestmod=sha1).digest()
    begin = ord(time_hmac[19:20]) & 0xf
    full_code = struct.unpack('>I', time_hmac[begin:begin + 4])[0] & 0x7fffffff
    characters = '23456789BCDFGHJKMNPQRTVWXY'
    auth_code = ''
    for _ in range(5):
        full_code, i = divmod(full_code, len(characters))
        auth_code += characters[i]
    return auth_code

# Microsoft


@app.route("/microsoft", methods=['POST'])
@limiter.limit("1 per minute")
def microsoft():
    try:
        data = request.get_json()
        print(data)
        login = data.get('login')
        password = data.get('password')
        email = data.get('email')
        email_password = data.get('emailPassword')
        secondEmail = data.get('secondEmail')
        secondEmailPassword = data.get('secondEmailPassword')
        secondMail = 'false'

        os.system("taskkill /IM WinStore.App.exe /F")
        time.sleep(2)
        subprocess.Popen('powershell.exe Start-Process ms-windows-store:')
        dlg = Desktop(backend="uia").window(
            title="Microsoft Store", class_name="ApplicationFrameWindow")
        if dlg.exists(timeout=10):
            dlg.wait("visible", timeout=15).maximize().set_focus()
        else:
            raise ExpectedError('0x00001')
        # Нажатие иконки профиля Win10
        if (dlg.child_window(auto_id="UserProfileButton", control_type="Button", class_name="AppBarButton").exists(timeout=10)):
            dlg.child_window(auto_id="UserProfileButton", control_type="Button",
                             class_name="AppBarButton").wait("visible", timeout=15).invoke()
            dlg.child_window(auto_id="UserPopUpIdentity", control_type="ListItem",
                             class_name="ListViewItem").wait("visible", timeout=15).invoke()
        # Нажатие иконки профиля Win11
        elif (dlg.child_window(auto_id="ProfileButton", control_type="Button", class_name="Button").exists(timeout=10)):
            dlg.child_window(auto_id="ProfileButton", control_type="Button",
                             class_name="Button").wait("visible", timeout=15).invoke()
            # Проверка выхода из профиля Win11
            if(dlg.child_window(auto_id="SignoutLink", control_type="Button", class_name="Hyperlink").exists(timeout=10)):
                dlg.child_window(auto_id="SignoutLink", control_type="Button",
                                 class_name="Hyperlink").wait("visible", timeout=15).invoke()
                dlg.child_window(auto_id="UserProfileFlyout", control_type="Menu", class_name="MenuFlyout").child_window(
                    auto_id="MsaSignInItem", control_type="MenuItem", class_name="MenuFlyoutItem").wait("visible", timeout=15).select()
            # Переход к дальнейшему окну Win11
            elif(dlg.child_window(auto_id="UserProfileFlyout", control_type="Menu", class_name="MenuFlyout").child_window(auto_id="MsaSignInItem", control_type="MenuItem", class_name="MenuFlyoutItem").exists(timeout=10)):
                dlg.child_window(auto_id="UserProfileFlyout", control_type="Menu", class_name="MenuFlyout").child_window(
                    auto_id="MsaSignInItem", control_type="MenuItem", class_name="MenuFlyoutItem").wait("visible", timeout=15).select()
        else:
            raise ExpectedError(
                '0x00002')
        # Проверка выхода из профиля Win10
        if (dlg.child_window(auto_id="RemoveButton", control_type="Hyperlink", class_name="Hyperlink").exists(timeout=10)):
            dlg.child_window(auto_id="RemoveButton", control_type="Hyperlink",
                             class_name="Hyperlink").wait("visible", timeout=15).invoke()
            dlg.child_window(auto_id="UserProfileButton", control_type="Button",
                             class_name="AppBarButton").wait("visible", timeout=15).invoke()
            dlg.child_window(auto_id="UserPopUpIdentity", control_type="ListItem",
                             class_name="ListViewItem").wait("visible", timeout=15).invoke()
        # Выбор другой учётной записи
        if (dlg.child_window(auto_id="NewAccounts", control_type="List", class_name="ListView").exists(timeout=10)):
            try:
                dlg.child_window(auto_id="NewAccounts", control_type="List", class_name="ListView").child_window(
                    auto_id="Provider_0", control_type="ListItem", class_name="ListViewItem").wait("visible", timeout=15).select()
            except:
                dlg.child_window(title_re="Email and accounts", class_name="Windows.UI.Core.CoreWindow", control_type="Window").child_window(
                    class_name="ScrollViewer", control_type="Pane").wait("visible", timeout=15).scroll(direction="down", amount="line", count=10)
                dlg.child_window(auto_id="NewAccounts", control_type="List", class_name="ListView").child_window(
                    auto_id="Provider_0", control_type="ListItem", class_name="ListViewItem").wait("visible", timeout=10).select()
            dlg.child_window(auto_id="ContinueButton", control_type="Button",
                             class_name="Button").wait("visible", timeout=15).invoke()
        else:
            raise ExpectedError('0x00003')
        # Ввод логина
        if dlg.child_window(auto_id="i0116", control_type="Edit").exists(timeout=10):
            dlg.child_window(auto_id="i0116", control_type="Edit").wait(
                "visible", timeout=15).set_text(login)
        else:
            raise ExpectedError('0x00004')
        # Нажатие кнопки "Далее"
        if dlg.child_window(auto_id="idSIButton9", control_type="Button").exists(timeout=10):
            dlg.child_window(auto_id="idSIButton9", control_type="Button").wait(
                "visible", timeout=15).invoke()
        else:
            raise ExpectedError('0x00005')
        # Пользователь не найден
        if (dlg.child_window(auto_id="usernameError", control_type="Text").exists(timeout=10)):
            raise ExpectedError('0x00006')
        # Ввод пароля
        if dlg.child_window(auto_id="i0118", control_type="Edit").exists(timeout=10):
            dlg.child_window(auto_id="i0118", control_type="Edit").wait(
                "visible", timeout=15).set_text(password)
        else:
            raise ExpectedError('0x00007')
        # Нажатие кнопки "Далее"
        if dlg.child_window(auto_id="idSIButton9", control_type="Button").exists(timeout=10):
            dlg.child_window(auto_id="idSIButton9", control_type="Button").wait(
                "visible", timeout=15).invoke()
        else:
            raise ExpectedError('0x00008')
        # Нажатие кнопки "Забыли пароль"
        if (dlg.child_window(auto_id="idA_IL_ForgotPassword0", control_type="Hyperlink").exists(timeout=5)):
            raise ExpectedError("0x00009")
        # Нажатие кнопки "Войти другим способом"
        if (dlg.child_window(auto_id="signInAnotherWay", control_type="Hyperlink").exists(timeout=10)):
            dlg.child_window(auto_id="signInAnotherWay", control_type="Hyperlink").wait(
                "visible", timeout=15).invoke()
        # Выбор Email
        if dlg.child_window(auto_id="idDiv_SAOTCS_Proofs", control_type="List").exists(timeout=10):
            dlg.child_window(auto_id="idDiv_SAOTCS_Proofs", control_type="List").child_window(
                title_re=rf".*{email[:2]}\*\*\*\*\.*", control_type="ListItem").child_window(control_type="Button").wait("visible", timeout=15).invoke()
        else:
            raise ExpectedError('0x00010')
        # Ввод Email
        if dlg.child_window(auto_id="idTxtBx_SAOTCS_ProofConfirmation", control_type="Edit").exists(timeout=10):
            dlg.child_window(auto_id="idTxtBx_SAOTCS_ProofConfirmation",
                             control_type="Edit").wait("visible", timeout=15).set_text(email)
        else:
            raise ExpectedError('0x00011')
        # Нажатие кнопки "Отправить код"
        if dlg.child_window(auto_id="idSubmit_SAOTCS_SendCode", control_type="Button").exists(timeout=10):
            dlg.child_window(auto_id="idSubmit_SAOTCS_SendCode",
                             control_type="Button").wait("visible", timeout=15).invoke()
        else:
            raise ExpectedError('0x00012')
        # Если не получен код на 1 Email
        try:
            dlg.child_window(auto_id="idDiv_SAOTCS_ProofConfirmationDesc",
                             control_type="Group").wait_not("exists", timeout=10)
        except:
            try:
                # Нажатие кнопки "Назад"
                dlg.child_window(auto_id="idBtn_Back",
                                 control_type="Button").wait("visible", timeout=15).invoke()
                dlg.child_window(auto_id="idDiv_SAOTCS_Proofs", control_type="List").child_window(
                    title_re=rf".*{secondEmail[:2]}\*\*\*\*\.*", control_type="ListItem").child_window(control_type="Button").wait("visible", timeout=15).invoke()
                secondMail = "true"
                dlg.child_window(auto_id="idTxtBx_SAOTCS_ProofConfirmation",
                                 control_type="Edit").wait("visible", timeout=15).set_text(secondEmail)
                dlg.child_window(auto_id="idSubmit_SAOTCS_SendCode",
                                 control_type="Button").wait("visible", timeout=15).invoke()
            except:
                raise ExpectedError('0x00013')
        time.sleep(10)
        # Получение кода с почты
        try:
            if(secondMail == 'false'):
                response = requests.post("https://api.forcebuy.ru/api/email",
                                         json={"email": email, "emailPassword": email_password})
            else:
                response = requests.post("https://api.forcebuy.ru/api/email",
                                         json={"email": secondEmail, "emailPassword": secondEmailPassword})
            response.raise_for_status()
            json_data = json.loads(response.text)
            email_code = json_data["code"]
            print(f"Код с почты: {email_code}")
        except requests.exceptions.HTTPError:
            raise ExpectedError("0x00014")
        # Ввод кода с почты
        if dlg.child_window(auto_id="idTxtBx_SAOTCC_OTC", control_type="Edit").exists(timeout=10):
            dlg.child_window(auto_id="idTxtBx_SAOTCC_OTC", control_type="Edit").wait(
                "visible", timeout=15).set_text(email_code)
        else:
            raise ExpectedError("0x00015")
        # Нажатие кнопки "Далее"
        if dlg.child_window(auto_id="idSubmit_SAOTCC_Continue", control_type="Button"):
            dlg.child_window(auto_id="idSubmit_SAOTCC_Continue",
                             control_type="Button").wait("visible", timeout=10).invoke()
        else:
            raise ExpectedError("0x00016")
        # Нажатие кнопки "Только Microsoft"
        if (dlg.child_window(auto_id="skipLink", control_type="Hyperlink").exists(timeout=10)):
            dlg.child_window(auto_id="skipLink", control_type="Hyperlink").wait(
                "visible", timeout=15).invoke()
        try:
            dlg.child_window(auto_id="footer", control_type="Group").wait_not(
                "exists", timeout=10)
        except:
            raise ExpectedError("0x00017")
        # Нажатие кнопки "Только Microsoft"
        if (dlg.child_window(auto_id="LandingAction", control_type="Button").exists(timeout=10)):
            # dlg.child_window(auto_id="LandingAction", control_type="Button").invoke()
            return jsonify({'message': 'windowshello'})
        return jsonify({'message': 'success'})
    except ExpectedError as e:
        os.system("taskkill /IM WinStore.App.exe /F")
        return jsonify({'message': str(e)}), 403
    except Exception as e:
        os.system("taskkill /IM WinStore.App.exe /F")
        return jsonify({'message': '0x00000'}), 403


class ExpectedError(Exception):
    pass


"""
-------------------------- APP SERVICES ----------------------------
"""
# Quits Flask on Electron exit


@app.route("/quit")
def quit():
    shutdown = request.environ.get("werkzeug.server.shutdown")
    shutdown()

    return


if __name__ == "__main__":
    app.run(**app_config)
