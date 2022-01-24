import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OktaSDKAuthService } from 'app/shared/okta/okta-auth-service';
import { OktaConfigService } from "app/shared/okta/okta-config.service";
import {
  OktaAuth,
  OktaAuthOptions,
  TokenManager,
  AccessToken,
  IDToken,
  UserClaims,
  TokenParams
} from '@okta/okta-auth-js'
import { OktaGroupInfo, PortalApps } from 'app/shared/okta/okta-group-info';
import { HowtoComponent } from 'app/howto/howto.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';



@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PortalComponent implements OnInit {
  strAccessToken;
  strUserID;

  PortalApps = PortalApps;
  AppsFromGroup = [];

  UserLoggedIn: any;
  strWelcome: any;
  authService = new OktaAuth(this.oktaSDKAuth.config);
  strUserSession: Boolean;

  strMemberSite: any;
  strMemberBBS: any;
  strMemberMoodle: any;

  strGroupMemberships: any;
  arrGroups: any;


  constructor(
    private _snackBar: MatSnackBar,
    private oktaSDKAuth: OktaSDKAuthService,
    private OktaConfigService: OktaConfigService,
    public HowtoComponent: HowtoComponent,
    public _matdialog: MatDialog
  ) { }

  OpenHowto() {
    const HowtoDialogConfig = new MatDialogConfig();
    HowtoDialogConfig.disableClose = false;
    HowtoDialogConfig.id = "widget-modal-component";
    HowtoDialogConfig.height = "70%";
    HowtoDialogConfig.width = "50%";
    const modalDialog = this._matdialog.open(HowtoComponent, HowtoDialogConfig);
  }


  async ngOnInit() {
    //console.log("Hiding restricted content until user group membership is verified.....")

    //////////////////////////// DO NOT DELETE ////////////////////////////
    // document.getElementById("memberNews").style.visibility = "hidden";
    // document.getElementById("memberDentaku").style.visibility = "hidden";
    ///////////////////////////////////////////////////////////////////////

    this.strUserSession = await this.authService.session.exists()
      .then(function (exists) {
        if (exists) {
          // logged in
          console.log("User session to Okta : " + exists);
          return exists
        } else {
          // not logged in
          //console.log(exists);

          return exists
        }
      });

    switch (this.strUserSession == true) {
      case false:
        //alert(this.oktaSDKAuth.config.redirectUri)
        // this.openSnackBar()
        console.log("User session not found, redirecting to " + this.OktaConfigService.strPostLogoutURL);
        window.location.replace(this.OktaConfigService.strPostLogoutURL);

      case true:
        var strSession = this.authService.token.getWithoutPrompt({
          responseType: 'id_token', // or array of types
          sessionToken: 'testSessionToken', // optional if the user has an existing Okta session           
        })
          .then(function (res) {
            var tokens = res.tokens;
            console.log("Displaying user token information");
            console.log(res.tokens);
            //console.log(res.state);
            var strUser = tokens.idToken.claims.email;
            //console.log(strUser);
            return [tokens.idToken.claims.email, tokens.accessToken.accessToken, tokens.accessToken.claims.uid];
          }
          )

        this.strGroupMemberships = await this.authService.token.getWithoutPrompt()
        // console.log(this.strGroupMemberships.tokens.idToken.claims.okta_groups);
        // console.log(this.strGroupMemberships.tokens.idToken.claims.okta_groups.length);
        this.arrGroups = this.strGroupMemberships.tokens.idToken.claims.okta_groups;

        for (var i = 0; i < this.strGroupMemberships.tokens.idToken.claims.okta_groups.length; i++) {
          //this.arrGroups[i].toUpperCase())
          ////////////////////////////////////////////////////////////////////////////////////////////////
          ////////////////////////////////////////////////////////////////////////////////////////////////


          for (var j = 0; j < this.PortalApps.length; j++) {
            if (this.strGroupMemberships.tokens.idToken.claims.okta_groups[i] == this.PortalApps[j].groupname) {
              console.log("Found : " + this.PortalApps[j].groupname);
              this.AppsFromGroup.push(this.PortalApps[j]);
            }
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////
          ////////////////////////////////////////////////////////////////////////////////////////////////

        }
        const strUserGet = async () => {
          const strUseremail = await strSession;
          this.UserLoggedIn = strUseremail[0];
          // this.strAccessToken = strUseremail[1];
          // this.strUserID = strUseremail[2];
          this.strWelcome = "ようこそ";
          // console.log(this.strAccessToken);
          // console.log(this.strUserID);  

        }

        if (location.pathname == "/profile") {
          //If not in the profile page, don't get the current user
        }
        else {
          strUserGet();

        }
    }
    console.log(this.AppsFromGroup);

  }


}




