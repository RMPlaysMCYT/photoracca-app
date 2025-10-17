!include MUI2.nsh

; Define variables that electron-builder expects
!define PRODUCT_NAME "PhotoRacca App"
!define PRODUCT_FILENAME "PhotoRacca App"
!define VERSION "0.3.0-Alpha"

; Interface configuration
!define MUI_ABORTWARNING
!define MUI_ICON "public/favicon.ico"
!define MUI_UNICON "public/favicon.ico"

; Custom wizard images (170x320 pixels)
; If you have a custom wizard bitmap place it under the build/ folder and
; set the path here. The example below is commented out to avoid errors when
; the bitmap is not present in the repository.
; !define MUI_WELCOMEFINISHPAGE_BITMAP "build/Photoracca_Wizard.bmp"

; Header images (150x57 pixels) - these are automatically used from package.json

; Pages configuration
!insertmacro MUI_PAGE_WELCOME
; License file: makensis is run from the project root during packaging so
; reference the path where the license actually lives in the repo. We use
; 'public/license.txt' so the compiler can find it at build time.
!insertmacro MUI_PAGE_LICENSE "license.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish page configuration
!define MUI_FINISHPAGE_TITLE "Installation Complete"
!define MUI_FINISHPAGE_TEXT "PhotoRacca App has been successfully installed on your computer.$\r$\n$\r$\nClick Finish to close this wizard."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${PRODUCT_FILENAME}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Run PhotoRacca App now"
!define MUI_FINISHPAGE_RUN_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_TEXT "View Documentation"
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_LINK "Visit GitHub Repository"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/RMPlaysMCYT"
!define MUI_FINISHPAGE_NOREBOOTSUPPORT
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Set language
!insertmacro MUI_LANGUAGE "English"

; Branding text
BrandingText "PhotoRacca App v${VERSION}"

; Installation directory
InstallDir "$PROGRAMFILES64\PhotoRacca"

; Show installation details
ShowInstDetails show
ShowUnInstDetails show

; Main installation section
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  ; Your files are automatically included by electron-builder
  ; This section runs after electron-builder extracts the app
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\PhotoRacca"
  CreateShortcut "$SMPROGRAMS\PhotoRacca\PhotoRacca.lnk" "$INSTDIR\${PRODUCT_FILENAME}.exe"
  CreateShortcut "$SMPROGRAMS\PhotoRacca\Uninstall PhotoRacca.lnk" "$INSTDIR\uninstall.exe"
  CreateShortcut "$DESKTOP\PhotoRacca.lnk" "$INSTDIR\${PRODUCT_FILENAME}.exe"
  
  ; Write registry for Add/Remove Programs
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                   "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                   "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                   "DisplayIcon" "$INSTDIR\${PRODUCT_FILENAME}.exe"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                   "Publisher" "RMPlaysMCYT"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                   "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" \
                   "URLInfoAbout" "https://github.com/RMPlaysMCYT"
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove application files
  RMDir /r "$INSTDIR"

  ; Remove shortcuts
  Delete "$DESKTOP\PhotoRacca.lnk"
  RMDir /r "$SMPROGRAMS\PhotoRacca"

  ; Remove registry entries
  DeleteRegKey HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
SectionEnd