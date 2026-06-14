import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService, ThemeService, ThemeOption } from '../../core/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public pairingEngine: string = 'javafo';
  public isJaVaFoInstalled: boolean = false;
  public isJavaInstalled: boolean = false;
  public javaVersion: string = '';
  public isDownloading: boolean = false;
  public appTheme: ThemeOption = 'system';

  constructor(
    private electronService: ElectronService,
    private themeService: ThemeService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.pairingEngine = localStorage.getItem('pairing_engine') || 'javafo';
    this.appTheme = this.themeService.getThemePreference();
    this.checkJaVaFo();
  }

  onThemeChange() {
    this.themeService.setTheme(this.appTheme);
  }

  onEngineChange() {
    localStorage.setItem('pairing_engine', this.pairingEngine);
    if (this.pairingEngine === 'javafo') {
      this.checkJaVaFo();
    }
  }

  async checkJaVaFo() {
    if (this.electronService.isElectron) {
      try {
        let javaResult = await this.electronService.ipcRenderer.invoke('controller.javafo.check-java');
        console.log("Java check result:", javaResult);
        if (javaResult && javaResult.ok === 1) {
          this.isJavaInstalled = true;
          this.javaVersion = javaResult.version;
        } else {
          this.isJavaInstalled = false;
          this.javaVersion = '';
        }
      } catch (err) {
        console.error("Erro IPC check-java:", err);
        this.isJavaInstalled = false;
      }

      try {
        this.isJaVaFoInstalled = await this.electronService.ipcRenderer.invoke('controller.javafo.check');
        console.log("JaVaFo check result:", this.isJaVaFoInstalled);
      } catch (err) {
        console.error("Erro IPC check javafo:", err);
        this.isJaVaFoInstalled = false;
      }
      
      this.ref.detectChanges();
    }
  }

  async downloadJaVaFo() {
    if (this.electronService.isElectron) {
      this.isDownloading = true;
      this.ref.detectChanges();
      
      let result = await this.electronService.ipcRenderer.invoke('controller.javafo.download');
      
      this.isDownloading = false;
      if (result && result.ok === 1) {
        this.isJaVaFoInstalled = true;
        Swal.fire({
          title: 'Sucesso!',
          text: 'JaVaFo foi baixado e instalado com sucesso. Agora ele está pronto para uso.',
          icon: 'success',
          confirmButtonText: 'Fechar'
        });
      } else {
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível baixar o JaVaFo: ' + (result ? result.message : 'Erro desconhecido'),
          icon: 'error',
          confirmButtonText: 'Fechar'
        });
      }
      this.ref.detectChanges();
    }
  }
}
