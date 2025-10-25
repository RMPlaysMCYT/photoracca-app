!include MUI2.nsh

!insertmacro MUI_LANGUAGE "English"

; Interface configuration
!define MUI_ABORTWARNING

; Insert ALL pages BEFORE MUI_LANGUAGE
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "public\LICENSE"
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

; Set language - MUST BE AFTER ALL PAGE MACROS


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

Section "Uninstall"
  ; Remove application files
  RMDir /r "$INSTDIR"

  ; Remove shortcuts
  Delete "$DESKTOP\PhotoRacca.lnk"
  RMDir /r "$SMPROGRAMS\PhotoRacca"

  ; Remove registry entries
  DeleteRegKey HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
SectionEnd