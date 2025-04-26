import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMainContentComponent } from './chat-main-content.component';

describe('ChatMainContentComponent', () => {
  let component: ChatMainContentComponent;
  let fixture: ComponentFixture<ChatMainContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMainContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
