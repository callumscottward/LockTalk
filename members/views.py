from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Member

def main(request):
    template = loader.get_template('main.html')
    return HttpResponse(template.render())

def members(request):
    mymembers = Member.objects.all().values()
    template = loader.get_template('allMembers.html')
    context = {
        'mymembers': mymembers
    }
    return HttpResponse(template.render(context, request))


def detail(request, id):
    member = Member.objects.get(id=id)
    template = loader.get_template('memberDetails.html')
    context = {
        'member': member
    }
    return HttpResponse(template.render(context, request))