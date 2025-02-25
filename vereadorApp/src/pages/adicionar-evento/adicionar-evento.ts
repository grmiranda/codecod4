import { Component } from '@angular/core';
import { NavParams, AlertController, ViewController, ToastController } from 'ionic-angular';
import { Evento } from '../../model/evento';
import { EventoService } from '../../providers/evento-service';
import { StorageService } from '../../providers/storage';

@Component({
  selector: 'page-adicionar-evento',
  templateUrl: 'adicionar-evento.html'
})
export class AdicionarEventoPage {
  private evento: Evento = new Evento();
  private horaInicio = "";
  private horaTermino = "";
  private desabilitar:boolean = false;

  constructor(
    private toastCtrl: ToastController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public view: ViewController,
    private eventoService: EventoService,
    private storageService: StorageService
  ) {
    this.evento.DataInicio = this.navParams.get("dataAtual");
    this.evento.DataFim = this.navParams.get("dataAtual");
    this.storageService.get().then(res => this.evento.IDUsuario = res.IDUsuario);
  }

  private adicionar() {
    this.desabilitar = true;
    if (this.validate()) {
      this.eventoService.addEvento(this.evento).then(res => {
        if (res.Titulo != undefined && res.Titulo != null) {
          this.presentToast("Evento adicionado com sucesso");
          this.view.dismiss(this.evento);
        } else {
          this.showConfirm();
        }
      });
    } else{
      this.desabilitar = false;
    }
  }

  private validate(): boolean {
    if (this.evento.Titulo == "") {
      this.presentToast("Coloque o titulo do evento");
      return false;
    } else if (this.evento.Descricao == "") {
      this.presentToast("Faça uma breve descrição do evento");
      return false;
    } else if (this.evento.DataInicio > this.evento.DataFim) {
      this.presentToast("Data de termino está errada");
      return false;
    } else if (!this.evento.Allday) {
      if (this.horaInicio == "") {
        this.presentToast("Coloque a hora de inicio do evento");
        return false;
      } else if (this.horaTermino == "") {
        this.presentToast("Coloque a hora de término do evento");
        return false;
      } else if (this.horaInicio > this.horaTermino) {
        this.presentToast("Hora de término está errada evento");
        return false;
      }
    } else if (this.evento.Allday) {
      this.horaInicio = "00:00";
      this.horaTermino = "23:59";
    }
    this.evento.DataInicio = this.evento.DataInicio + " " + this.horaInicio + ":00";
    this.evento.DataFim = this.evento.DataFim + " " + this.horaTermino + ":00";
    return true;
  }

  private cancel() {
    this.view.dismiss();
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  private showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Falha na conexão',
      message: 'Tentar Novamente ?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.desabilitar = false;
          }
        },
        {
          text: 'Ok',
          handler: () => {
            this.adicionar();
          }
        }
      ]
    });
    confirm.present();
  }

}
